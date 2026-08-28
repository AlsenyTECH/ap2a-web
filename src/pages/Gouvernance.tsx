import { useState } from 'react'
import { CalendarDays, Landmark, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button, Card, CardContent, ConfirmDialog, EmptyState, Skeleton } from '@/components/ui'
import { useAuth } from '@/lib/auth/AuthContext'
import { useComptesRendus, useSupprimerCompteRendu } from '@/lib/queries'
import { formatDate } from '@/lib/utils/format'
import type { CompteRendu } from '@/lib/api/types'
import { CompteRenduDialog } from './gouvernance/CompteRenduDialog'

export default function Gouvernance() {
  const { hasPermission } = useAuth()
  const peutGerer = hasPermission('GERER_GOUVERNANCE')

  const comptesRendus = useComptesRendus()
  const supprimer = useSupprimerCompteRendu()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [compteRenduAEditer, setCompteRenduAEditer] = useState<CompteRendu | null>(null)
  const [compteRenduASupprimer, setCompteRenduASupprimer] = useState<CompteRendu | null>(null)

  function openCreate() {
    setCompteRenduAEditer(null)
    setDialogOpen(true)
  }

  function openEdit(cr: CompteRendu) {
    setCompteRenduAEditer(cr)
    setDialogOpen(true)
  }

  async function handleDelete() {
    if (!compteRenduASupprimer) return
    await supprimer.mutateAsync(compteRenduASupprimer.id_compte_rendu)
    setCompteRenduASupprimer(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground">Gouvernance</h1>
          <p className="text-sm text-muted-foreground">Comptes-rendus des réunions du bureau exécutif.</p>
        </div>
        {peutGerer && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nouveau compte-rendu
          </Button>
        )}
      </div>

      {comptesRendus.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {!comptesRendus.isLoading && (!comptesRendus.data || comptesRendus.data.length === 0) && (
        <EmptyState
          icon={Landmark}
          title="Aucun compte-rendu"
          description={
            peutGerer
              ? 'Créez le premier compte-rendu de réunion du bureau.'
              : "Aucun compte-rendu n'a encore été publié."
          }
        />
      )}

      {!comptesRendus.isLoading && comptesRendus.data && comptesRendus.data.length > 0 && (
        <div className="space-y-3">
          {comptesRendus.data.map((cr) => (
            <Card key={cr.id_compte_rendu}>
              <CardContent className="space-y-2 pt-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{cr.titre}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      {formatDate(cr.date_reunion)} — par {cr.cree_par}
                    </p>
                  </div>
                  {peutGerer && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => openEdit(cr)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={() => setCompteRenduASupprimer(cr)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="whitespace-pre-line text-sm text-foreground">{cr.contenu}</p>
                {cr.decisions && (
                  <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Décisions</p>
                    <p className="mt-1 whitespace-pre-line text-sm text-foreground">{cr.decisions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {peutGerer && (
        <>
          <CompteRenduDialog open={dialogOpen} onOpenChange={setDialogOpen} compteRendu={compteRenduAEditer} />
          <ConfirmDialog
            open={Boolean(compteRenduASupprimer)}
            onOpenChange={(open) => !open && setCompteRenduASupprimer(null)}
            title="Supprimer le compte-rendu"
            description={`Voulez-vous vraiment supprimer « ${compteRenduASupprimer?.titre ?? ''} » ?`}
            confirmLabel="Supprimer"
            variant="destructive"
            loading={supprimer.isPending}
            onConfirm={handleDelete}
          />
        </>
      )}
    </div>
  )
}
