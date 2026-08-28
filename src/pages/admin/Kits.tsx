import { useState } from 'react'
import { Package, PackageCheck, Pencil, Plus, Trash2, Users2 } from 'lucide-react'
import { Badge, Button, Card, CardContent, ConfirmDialog, EmptyState, Skeleton } from '@/components/ui'
import { useKits, useSupprimerKit } from '@/lib/queries'
import { formatDate } from '@/lib/utils/format'
import type { Kit } from '@/lib/api/types'
import { KitDialog } from './kits/KitDialog'
import { KitDistributionDialog } from './kits/KitDistributionDialog'

const LABEL_CIBLE: Record<Kit['type_cible'], string> = {
  FORMATION: 'Toute la formation',
  COHORTE: 'Une cohorte',
  PARTICIPANTS: 'Participants précis',
}

function DescriptionCible({ kit }: { kit: Kit }) {
  if (kit.type_cible === 'FORMATION' && kit.formation) {
    return <span>{kit.formation.titre}</span>
  }
  if (kit.type_cible === 'COHORTE' && kit.cohorte) {
    return <span>{kit.cohorte.code_cohorte}</span>
  }
  if (kit.type_cible === 'PARTICIPANTS' && kit.cohorte) {
    return (
      <span>
        {kit.cohorte.code_cohorte} — {kit.participants_cibles.length} participant(s)
      </span>
    )
  }
  return <span>—</span>
}

export default function Kits() {
  const kits = useKits()
  const supprimerKit = useSupprimerKit()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [kitToEdit, setKitToEdit] = useState<Kit | null>(null)
  const [kitToDelete, setKitToDelete] = useState<Kit | null>(null)
  const [kitDistribution, setKitDistribution] = useState<Kit | null>(null)

  function openCreate() {
    setKitToEdit(null)
    setDialogOpen(true)
  }

  function openEdit(kit: Kit) {
    setKitToEdit(kit)
    setDialogOpen(true)
  }

  async function handleDelete() {
    if (!kitToDelete) return
    await supprimerKit.mutateAsync(kitToDelete.id_kit)
    setKitToDelete(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground">Kits Pédagogiques</h1>
          <p className="text-sm text-muted-foreground">
            Préparez le contenu d'un kit et choisissez à qui il est destiné — une formation n'implique pas
            systématiquement un kit.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nouveau kit
        </Button>
      </div>

      {kits.isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      )}

      {!kits.isLoading && (!kits.data || kits.data.length === 0) && (
        <EmptyState
          icon={Package}
          title="Aucun kit préparé"
          description="Créez un kit lorsque vous en avez besoin pour une formation, une cohorte ou certains participants."
        />
      )}

      {!kits.isLoading && kits.data && kits.data.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {kits.data.map((kit) => (
            <Card key={kit.id_kit}>
              <CardContent className="space-y-3 pt-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{kit.nom}</p>
                  <Badge variant="secondary">{LABEL_CIBLE[kit.type_cible]}</Badge>
                </div>
                <p className="line-clamp-3 whitespace-pre-line text-xs text-muted-foreground">{kit.contenu}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users2 className="size-3.5" />
                  <DescriptionCible kit={kit} />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Créé le {formatDate(kit.date_creation)}
                  {kit.cree_par ? ` par ${kit.cree_par}` : ''}
                </p>
                <div className="flex items-center justify-between gap-1 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setKitDistribution(kit)}>
                    <PackageCheck className="size-3.5 mr-1" />
                    Distribution
                  </Button>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => openEdit(kit)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive"
                      onClick={() => setKitToDelete(kit)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <KitDialog open={dialogOpen} onOpenChange={setDialogOpen} kit={kitToEdit} />

      <KitDistributionDialog
        kit={kitDistribution}
        open={Boolean(kitDistribution)}
        onOpenChange={(open) => !open && setKitDistribution(null)}
      />

      <ConfirmDialog
        open={Boolean(kitToDelete)}
        onOpenChange={(open) => !open && setKitToDelete(null)}
        title="Supprimer le kit"
        description={`Voulez-vous vraiment supprimer « ${kitToDelete?.nom ?? ''} » ?`}
        confirmLabel="Supprimer"
        variant="destructive"
        loading={supprimerKit.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
