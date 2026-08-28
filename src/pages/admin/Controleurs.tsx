import { useState } from 'react'
import { CalendarPlus, KeyRound, Pencil, Plus, Shield, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { AssignerControleurDialog } from '@/pages/admin/controleurs/AssignerControleurDialog'
import { CreateControleurDialog } from '@/pages/admin/controleurs/CreateControleurDialog'
import { EditControleurDialog } from '@/pages/admin/controleurs/EditControleurDialog'
import { ReinitialiserMotDePasseDialog } from '@/pages/admin/controleurs/ReinitialiserMotDePasseDialog'
import { ZoneAffectationCell } from '@/pages/admin/controleurs/ZoneAffectationCell'
import { useControleurs, useSupprimerControleur } from '@/lib/queries'
import { formatDate } from '@/lib/utils/format'
import { statutCompteMeta } from '@/lib/utils/status'
import type { Controleur } from '@/lib/api/types'

export default function Controleurs() {
  const { data: controleurs, isLoading } = useControleurs()
  const supprimerControleur = useSupprimerControleur()
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editTarget, setEditTarget] = useState<Controleur | null>(null)
  const [assignerTarget, setAssignerTarget] = useState<Controleur | null>(null)
  const [resetTarget, setResetTarget] = useState<Controleur | null>(null)

  function handleDelete() {
    if (deleteId === null) return
    supprimerControleur.mutate(deleteId, { onSuccess: () => setDeleteId(null) })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Contrôleurs</h1>
          <p className="text-sm text-muted-foreground">Comptes habilités à scanner les cartes membres.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Nouveau contrôleur
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !controleurs || controleurs.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="Aucun contrôleur"
          description="Nommez un membre ou créez un compte externe pour commencer."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom Prénom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Zone d'affectation</TableHead>
              <TableHead>Événement assigné</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date nomination</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {controleurs.map((controleur) => (
              <TableRow key={controleur.id_controleur}>
                <TableCell className="font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    {controleur.prenom} {controleur.nom}
                    {controleur.est_aussi_membre && <Badge variant="outline">Aussi membre</Badge>}
                  </div>
                </TableCell>
                <TableCell>{controleur.email}</TableCell>
                <TableCell>
                  <ZoneAffectationCell
                    idControleur={controleur.id_controleur}
                    zoneAffectation={controleur.zone_affectation}
                  />
                </TableCell>
                <TableCell>
                  {controleur.evenement_assigne ? (
                    <Badge variant="outline">{controleur.evenement_assigne.titre}</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Aucun</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={statutCompteMeta(controleur.statut_compte).variant}>
                    {statutCompteMeta(controleur.statut_compte).label}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(controleur.date_nomination)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Modifier"
                      onClick={() => setEditTarget(controleur)}
                    >
                      <Pencil />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Assigner à un événement"
                      onClick={() => setAssignerTarget(controleur)}
                    >
                      <CalendarPlus />
                      <span className="sr-only">Assigner à un événement</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Réinitialiser le mot de passe"
                      onClick={() => setResetTarget(controleur)}
                    >
                      <KeyRound />
                      <span className="sr-only">Réinitialiser le mot de passe</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Supprimer"
                      onClick={() => setDeleteId(controleur.id_controleur)}
                    >
                      <Trash2 />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CreateControleurDialog open={createOpen} onOpenChange={setCreateOpen} />

      <EditControleurDialog
        controleur={editTarget}
        onOpenChange={(next) => !next && setEditTarget(null)}
      />
      <AssignerControleurDialog
        controleur={assignerTarget}
        onOpenChange={(next) => !next && setAssignerTarget(null)}
      />
      <ReinitialiserMotDePasseDialog
        controleur={resetTarget}
        onOpenChange={(next) => !next && setResetTarget(null)}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(next) => !next && setDeleteId(null)}
        title="Supprimer ce contrôleur"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="destructive"
        loading={supprimerControleur.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
