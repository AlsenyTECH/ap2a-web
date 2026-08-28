import { useMemo, useState } from 'react'
import { GraduationCap, Pencil, Plus, Trash2, Users2 } from 'lucide-react'
import { Badge, Button, ConfirmDialog, EmptyState, Skeleton } from '@/components/ui'
import { MasterDetailLayout } from '@/components/shared/MasterDetailLayout'
import { useCohortes, useFormations, useSupprimerFormation } from '@/lib/queries'
import { formatDate } from '@/lib/utils/format'
import { statutCohorteMeta } from '@/lib/utils/status'
import { cn } from '@/lib/utils'
import type { CohorteListItem, Formation } from '@/lib/api/types'
import { FormationDialog } from './formations/FormationDialog'
import { CreateCohorteDialog } from './formations/CreateCohorteDialog'
import { CohorteDetailPanel } from './formations/CohorteDetailPanel'

export default function Formations() {
  const [selectedFormationId, setSelectedFormationId] = useState<number | null>(null)
  const [selectedCohorteId, setSelectedCohorteId] = useState<number | null>(null)
  const [formationDialogOpen, setFormationDialogOpen] = useState(false)
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null)
  const [deletingFormation, setDeletingFormation] = useState<Formation | null>(null)
  const [createCohorteOpen, setCreateCohorteOpen] = useState(false)

  const formations = useFormations()
  const cohortes = useCohortes(selectedFormationId)
  const supprimerFormation = useSupprimerFormation()

  const selectedFormation = useMemo(
    () => formations.data?.find((f) => f.id_formation === selectedFormationId) ?? null,
    [formations.data, selectedFormationId],
  )

  const selectedCohorte = useMemo(
    () => cohortes.data?.find((c) => c.id_cohorte === selectedCohorteId) ?? null,
    [cohortes.data, selectedCohorteId],
  )

  function selectFormation(formation: Formation) {
    setSelectedFormationId(formation.id_formation)
    setSelectedCohorteId(null)
  }

  function openCreateFormation() {
    setEditingFormation(null)
    setFormationDialogOpen(true)
  }

  function openEditFormation(formation: Formation) {
    setEditingFormation(formation)
    setFormationDialogOpen(true)
  }

  async function handleDeleteFormation() {
    if (!deletingFormation) return
    await supprimerFormation.mutateAsync(deletingFormation.id_formation)
    if (selectedFormationId === deletingFormation.id_formation) {
      setSelectedFormationId(null)
      setSelectedCohorteId(null)
    }
    setDeletingFormation(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground">Formations</h1>
          <p className="text-sm text-muted-foreground">Catalogue de formations, cohortes et participants.</p>
        </div>
        <Button onClick={openCreateFormation}>
          <Plus className="size-4" />
          Nouvelle formation
        </Button>
      </div>

      {formations.isLoading && (
        <div className="flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-64" />
          ))}
        </div>
      )}

      {!formations.isLoading && (!formations.data || formations.data.length === 0) && (
        <EmptyState icon={GraduationCap} title="Aucune formation" description="Créez votre première formation pour commencer." />
      )}

      {!formations.isLoading && formations.data && formations.data.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {formations.data.map((formation) => {
            const selected = formation.id_formation === selectedFormationId
            return (
              <div
                key={formation.id_formation}
                onClick={() => selectFormation(formation)}
                className={cn(
                  'w-64 cursor-pointer rounded-lg border p-4 transition-colors',
                  selected ? 'border-primary bg-accent' : 'border-border bg-card hover:bg-muted',
                )}
              >
                <p className="text-sm font-medium text-foreground">{formation.titre}</p>
                {formation.code_reference && (
                  <p className="mt-1 text-xs text-muted-foreground">{formation.code_reference}</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">{formation.nombre_cohortes} cohorte(s)</p>
                <div className="mt-3 flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditFormation(formation)
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeletingFormation(formation)
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedFormation && (
        <MasterDetailLayout<CohorteListItem>
          orientation="stacked"
          items={cohortes.data ?? []}
          getId={(item) => item.id_cohorte}
          selectedId={selectedCohorteId}
          onSelect={(item) => setSelectedCohorteId(item.id_cohorte)}
          listLoading={cohortes.isLoading}
          listHeader={
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-muted-foreground">Cohortes de cette formation</h2>
              <Button size="sm" onClick={() => setCreateCohorteOpen(true)}>
                <Plus className="size-4" />
                Nouvelle cohorte
              </Button>
            </div>
          }
          emptyList={
            <EmptyState icon={Users2} title="Aucune cohorte" description="Créez une cohorte pour cette formation." />
          }
          renderItem={(item) => {
            const meta = statutCohorteMeta(item.statut)
            return (
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{item.code_cohorte}</p>
                  <div className="flex shrink-0 items-center gap-1">
                    {!item.est_payante && <Badge variant="success">Gratuite</Badge>}
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(item.date_debut)} → {formatDate(item.date_fin)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.nombre_inscrits}
                  {item.capacite_max != null ? ` / ${item.capacite_max}` : ''} inscrit(s)
                </p>
              </div>
            )
          }}
          detail={
            selectedCohorte ? (
              <CohorteDetailPanel
                key={selectedCohorte.id_cohorte}
                idCohorte={selectedCohorte.id_cohorte}
                codeCohorte={selectedCohorte.code_cohorte}
              />
            ) : (
              <EmptyState
                icon={Users2}
                title="Sélectionnez une cohorte"
                description="Choisissez une cohorte dans la liste pour voir ses détails."
                className="h-full"
              />
            )
          }
        />
      )}

      <FormationDialog open={formationDialogOpen} onOpenChange={setFormationDialogOpen} formation={editingFormation} />

      {selectedFormation && (
        <CreateCohorteDialog
          open={createCohorteOpen}
          onOpenChange={setCreateCohorteOpen}
          idFormation={selectedFormation.id_formation}
        />
      )}

      <ConfirmDialog
        open={Boolean(deletingFormation)}
        onOpenChange={(open) => !open && setDeletingFormation(null)}
        title="Supprimer la formation"
        description={`Voulez-vous vraiment supprimer « ${deletingFormation?.titre ?? ''} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="destructive"
        loading={supprimerFormation.isPending}
        onConfirm={handleDeleteFormation}
      />
    </div>
  )
}
