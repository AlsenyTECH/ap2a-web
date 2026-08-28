import { useState } from 'react'
import { CalendarX, UserPlus, Upload, Users, Pencil, Ban, Trash2, Sparkles } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  EmptyState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { ExcelImportModal } from '@/components/shared/ExcelImportModal'
import {
  useActerProgrammeEvenement,
  useAnnulerEvenement,
  useConfirmationsEvenement,
  useEvenementDetail,
  useImporterInvites,
  useSupprimerEvenement,
  useTerminerEvenement,
} from '@/lib/queries'
import { formatDateTime } from '@/lib/utils/format'
import { statutConfirmationMeta, typeEvenementLabel } from '@/lib/utils/status'
import { AjouterInviteDialog } from './AjouterInviteDialog'
import { EditEvenementDialog } from './EditEvenementDialog'

interface EvenementDetailPanelProps {
  idEvenement: number
  titre: string
  typeEvenement: string
  showTerminerAction: boolean
}

export function EvenementDetailPanel({
  idEvenement,
  titre,
  typeEvenement,
  showTerminerAction,
}: EvenementDetailPanelProps) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [annulerOpen, setAnnulerOpen] = useState(false)
  const [supprimerOpen, setSupprimerOpen] = useState(false)
  const [terminerOpen, setTerminerOpen] = useState(false)

  const confirmations = useConfirmationsEvenement(idEvenement)
  const detail = useEvenementDetail(idEvenement)
  const importerInvites = useImporterInvites()
  const annuler = useAnnulerEvenement()
  const supprimer = useSupprimerEvenement()
  const terminer = useTerminerEvenement()
  const acterProgramme = useActerProgrammeEvenement()

  async function handleTerminer() {
    await terminer.mutateAsync(idEvenement)
    setTerminerOpen(false)
  }

  async function handleAnnuler() {
    await annuler.mutateAsync(idEvenement)
    setAnnulerOpen(false)
  }

  async function handleSupprimer() {
    await supprimer.mutateAsync(idEvenement)
    setSupprimerOpen(false)
  }

  const isAnnule = detail.data?.est_annule
  const isTermine = detail.data?.est_termine
  const isBrouillon = detail.data?.statut === 'BROUILLON'

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between space-y-0">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">{titre}</CardTitle>
              <Badge variant="outline">{typeEvenementLabel[typeEvenement] ?? typeEvenement}</Badge>
              {isBrouillon && (
                <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
                  Brouillon
                </Badge>
              )}
              {isAnnule && <Badge variant="destructive">Annulé</Badge>}
              {!isAnnule && isTermine && <Badge variant="secondary">Terminé</Badge>}
              {!isAnnule && !isTermine && !isBrouillon && <Badge variant="success">Programmé</Badge>}
            </div>
            {detail.data?.lieu && (
              <p className="text-xs text-muted-foreground">Lieu : {detail.data.lieu}</p>
            )}
            {detail.data?.description && (
              <p className="text-xs text-muted-foreground mt-1">{detail.data.description}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isBrouillon && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                disabled={acterProgramme.isPending}
                onClick={() => acterProgramme.mutate(idEvenement)}
              >
                <Sparkles className="size-3.5 mr-1" />
                {acterProgramme.isPending ? 'Notification...' : 'Acter & Programmer'}
              </Button>
            )}
            {!isAnnule && !isTermine && (
              <>
                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                  <Pencil className="size-3.5 mr-1" />
                  Modifier
                </Button>
                <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                  <Upload className="size-3.5 mr-1" />
                  Invités (Excel)
                </Button>
                <Button size="sm" onClick={() => setInviteOpen(true)}>
                  <UserPlus className="size-3.5 mr-1" />
                  Invité
                </Button>
                <Button variant="outline" size="sm" className="text-amber-600 hover:text-amber-700" onClick={() => setAnnulerOpen(true)}>
                  <Ban className="size-3.5 mr-1" />
                  Annuler
                </Button>
              </>
            )}
            {showTerminerAction && !isAnnule && !isTermine && (
              <Button variant="destructive" size="sm" onClick={() => setTerminerOpen(true)}>
                <CalendarX className="size-3.5 mr-1" />
                Clôturer
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => setSupprimerOpen(true)}
            >
              <Trash2 className="size-3.5 mr-1" />
              Supprimer
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="confirmations">
        <TabsList>
          <TabsTrigger value="confirmations">Confirmations</TabsTrigger>
          <TabsTrigger value="presences">Présences enregistrées</TabsTrigger>
        </TabsList>

        <TabsContent value="confirmations">
          {confirmations.isLoading && <Skeleton className="h-48 w-full" />}
          {!confirmations.isLoading && confirmations.data && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <StatTile label="Confirmés" value={confirmations.data.nb_confirmes} />
                <StatTile label="Liste d'attente" value={confirmations.data.nb_liste_attente} />
                <StatTile label="Capacité max" value={confirmations.data.capacite_max ?? '—'} />
              </div>
              {confirmations.data.confirmations.length === 0 ? (
                <EmptyState icon={Users} title="Aucune confirmation" description="Personne n'a encore confirmé sa présence." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Membre</TableHead>
                      <TableHead>N° adhérent</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date de confirmation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {confirmations.data.confirmations.map((c) => {
                      const meta = statutConfirmationMeta(c.statut)
                      return (
                        <TableRow key={c.id_confirmation}>
                          <TableCell>{c.membre}</TableCell>
                          <TableCell>{c.numero_adherent}</TableCell>
                          <TableCell>
                            <Badge variant={meta.variant}>{meta.label}</Badge>
                          </TableCell>
                          <TableCell>{formatDateTime(c.date_confirmation)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="presences">
          {detail.isLoading && <Skeleton className="h-48 w-full" />}
          {!detail.isLoading && detail.data && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <StatTile label="Total participants" value={detail.data.total_participants} />
                <StatTile label="Séances" value={detail.data.nombre_seances} />
              </div>

              {Object.keys(detail.data.repartition_methode).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Répartition par méthode de scan</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2 pt-0">
                    {Object.entries(detail.data.repartition_methode).map(([methode, nombre]) => (
                      <Badge key={methode} variant="secondary">
                        {methode} : {nombre}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              )}

              {detail.data.participants.length === 0 ? (
                <EmptyState icon={Users} title="Aucune présence enregistrée" description="Aucun scan n'a encore été effectué pour cet événement." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>N° adhérent</TableHead>
                      <TableHead>Séance</TableHead>
                      <TableHead>Arrivée</TableHead>
                      <TableHead>Méthode</TableHead>
                      <TableHead>Contrôleur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.data.participants.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          {p.prenom} {p.nom}
                        </TableCell>
                        <TableCell>{p.numero_adherent}</TableCell>
                        <TableCell>{p.seance}</TableCell>
                        <TableCell>{formatDateTime(p.heure_arrivee)}</TableCell>
                        <TableCell>{p.methode_scan}</TableCell>
                        <TableCell>{p.controleur}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AjouterInviteDialog open={inviteOpen} onOpenChange={setInviteOpen} idEvenement={idEvenement} />

      <ExcelImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Importer des invités"
        instructions="Le fichier Excel doit contenir les colonnes nom, prenom, telephone (optionnel) et organisation (optionnel)."
        onImport={(fichier) => importerInvites.mutateAsync({ idEvenement, fichier })}
        renderResult={(result) => (
          <div className="space-y-2">
            <p>{result.message}</p>
            <p className="font-medium">{result.crees} invité(s) créé(s)</p>
            {result.erreurs.length > 0 && (
              <ul className="list-inside list-disc text-destructive">
                {result.erreurs.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      />

      {detail.data && (
        <EditEvenementDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          evenement={detail.data}
        />
      )}

      <ConfirmDialog
        open={annulerOpen}
        onOpenChange={setAnnulerOpen}
        title="Annuler l'événement"
        description="Cette action annulera l'événement et enverra une notification à tous les membres inscrits. Les contrôleurs assignés seront libérés."
        confirmLabel="Annuler l'événement"
        variant="destructive"
        loading={annuler.isPending}
        onConfirm={handleAnnuler}
      />

      <ConfirmDialog
        open={supprimerOpen}
        onOpenChange={setSupprimerOpen}
        title="Supprimer l'événement"
        description="Êtes-vous sûr de vouloir supprimer définitivement cet événement ? Cette action n'est possible que si aucune présence n'a été enregistrée."
        confirmLabel="Supprimer"
        variant="destructive"
        loading={supprimer.isPending}
        onConfirm={handleSupprimer}
      />

      <ConfirmDialog
        open={terminerOpen}
        onOpenChange={setTerminerOpen}
        title="Clôturer l'événement"
        description="Cette action marque l'événement comme terminé. Elle est irréversible."
        confirmLabel="Clôturer"
        variant="destructive"
        loading={terminer.isPending}
        onConfirm={handleTerminer}
      />
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}
