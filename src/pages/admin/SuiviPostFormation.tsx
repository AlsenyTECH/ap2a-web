import { useMemo, useState } from 'react'
import { ClipboardList, History, Plus } from 'lucide-react'
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { NouveauSuiviDialog } from '@/pages/admin/suivi/NouveauSuiviDialog'
import { HistoriqueSuiviSheet } from '@/pages/admin/suivi/HistoriqueSuiviSheet'
import { useCohortes, useFormations, useSuivisCohorte } from '@/lib/queries'
import { formatDate } from '@/lib/utils/format'
import { statutGlobalSuiviMeta } from '@/lib/utils/status'

export default function SuiviPostFormation() {
  const [idFormation, setIdFormation] = useState<string | null>(null)
  const [idCohorte, setIdCohorte] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [nouveauParticipant, setNouveauParticipant] = useState<{ id: number; nom: string } | null>(null)
  const [historiqueParticipantId, setHistoriqueParticipantId] = useState<number | null>(null)

  const { data: formations, isLoading: formationsLoading } = useFormations()
  const { data: cohortes, isLoading: cohortesLoading } = useCohortes(idFormation ? Number(idFormation) : null)
  const { data, isLoading } = useSuivisCohorte(idCohorte ? Number(idCohorte) : null)

  const participantsFiltres = useMemo(() => {
    if (!data) return []
    const q = search.trim().toLowerCase()
    if (!q) return data.participants
    return data.participants.filter((p) => `${p.prenom} ${p.nom}`.toLowerCase().includes(q))
  }, [data, search])

  function handleFormationChange(value: string) {
    setIdFormation(value)
    setIdCohorte(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Suivi post-formation</h1>
        <p className="text-sm text-muted-foreground">
          Accompagnement des participants après la fin d'une cohorte de formation.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={idFormation ?? ''} onValueChange={handleFormationChange} disabled={formationsLoading}>
          <SelectTrigger className="sm:w-64">
            <SelectValue placeholder="Choisir une formation" />
          </SelectTrigger>
          <SelectContent>
            {formations?.map((formation) => (
              <SelectItem key={formation.id_formation} value={String(formation.id_formation)}>
                {formation.titre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={idCohorte ?? ''} onValueChange={setIdCohorte} disabled={!idFormation || cohortesLoading}>
          <SelectTrigger className="sm:w-64">
            <SelectValue placeholder="Choisir une cohorte" />
          </SelectTrigger>
          <SelectContent>
            {cohortes?.map((cohorte) => (
              <SelectItem key={cohorte.id_cohorte} value={String(cohorte.id_cohorte)}>
                {cohorte.code_cohorte}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!idCohorte ? (
        <EmptyState
          icon={ClipboardList}
          title="Sélectionnez une cohorte"
          description="Choisissez une formation puis une cohorte pour afficher le suivi de ses participants."
        />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !data ? null : (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="font-heading text-lg font-semibold text-foreground">{data.formation}</p>
            <p className="text-sm text-muted-foreground">
              Cohorte {data.cohorte} · Durée de suivi : {data.duree_suivi_jours} jours
            </p>
          </div>

          <Input
            placeholder="Rechercher un participant…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />

          {participantsFiltres.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={search ? 'Aucun participant ne correspond à la recherche' : 'Aucun participant'}
              description={search ? 'Essayez un autre nom.' : 'Cette cohorte ne compte aucun participant.'}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom Prénom</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Nb suivis</TableHead>
                  <TableHead>Dernier suivi</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participantsFiltres.map((participant) => {
                  const nomComplet = `${participant.prenom} ${participant.nom}`
                  return (
                    <TableRow
                      key={participant.id_participant}
                      className="cursor-pointer"
                      onClick={() => setNouveauParticipant({ id: participant.id_participant, nom: nomComplet })}
                    >
                      <TableCell className="font-medium text-foreground">{nomComplet}</TableCell>
                      <TableCell>{participant.telephone ?? '—'}</TableCell>
                      <TableCell>{participant.nb_suivis}</TableCell>
                      <TableCell>
                        {!participant.dernier_suivi ? (
                          <span className="text-sm text-muted-foreground">Aucun suivi</span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant={statutGlobalSuiviMeta(participant.dernier_suivi.statut).variant}>
                              {statutGlobalSuiviMeta(participant.dernier_suivi.statut).label}
                            </Badge>
                            {participant.dernier_suivi.kit_remis && <Badge variant="outline">Kit</Badge>}
                            {participant.dernier_suivi.certificat_emis && (
                              <Badge variant="outline">Certificat</Badge>
                            )}
                            {participant.dernier_suivi.activite_lancee && (
                              <Badge variant="outline">Activité</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(participant.dernier_suivi.date)}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              setNouveauParticipant({ id: participant.id_participant, nom: nomComplet })
                            }}
                            title="Nouvelle fiche de suivi"
                          >
                            <Plus />
                            <span className="sr-only">Nouvelle fiche de suivi</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              setHistoriqueParticipantId(participant.id_participant)
                            }}
                            title="Historique"
                          >
                            <History />
                            <span className="sr-only">Historique</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      <NouveauSuiviDialog
        open={nouveauParticipant !== null}
        onOpenChange={(open) => !open && setNouveauParticipant(null)}
        idParticipant={nouveauParticipant?.id ?? null}
        idCohorte={idCohorte ? Number(idCohorte) : null}
        participantNom={nouveauParticipant?.nom}
      />

      <HistoriqueSuiviSheet
        idParticipant={historiqueParticipantId}
        onOpenChange={(open) => !open && setHistoriqueParticipantId(null)}
      />
    </div>
  )
}
