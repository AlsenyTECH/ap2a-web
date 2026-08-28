import { useState } from 'react'
import { CreditCard, Mail, Pencil } from 'lucide-react'
import {
  Badge,
  ConfirmDialog,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { Button } from '@/components/ui/button'
import { apiErrorCode } from '@/lib/api/client'
import { useActiverCarte, useBloquerCarte, useMembre, useRenvoyerIdentifiants } from '@/lib/queries'
import { formatDate } from '@/lib/utils/format'
import { statutAdhesionMeta, statutCarteMeta } from '@/lib/utils/status'
import { EditMembreDialog } from './EditMembreDialog'
import { DemanderEmailDialog } from './DemanderEmailDialog'

interface MembreDetailSheetProps {
  idMembre: number | null
  onOpenChange: (open: boolean) => void
}

export function MembreDetailSheet({ idMembre, onOpenChange }: MembreDetailSheetProps) {
  const open = idMembre !== null
  const { data: membre, isLoading } = useMembre(idMembre)
  const bloquerCarte = useBloquerCarte()
  const activerCarte = useActiverCarte()
  const renvoyerIdentifiants = useRenvoyerIdentifiants()
  const [confirmAction, setConfirmAction] = useState<'bloquer' | 'reactiver' | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [demanderEmailOpen, setDemanderEmailOpen] = useState(false)

  function handleConfirm() {
    if (!membre?.id_carte_active) return
    if (confirmAction === 'bloquer') {
      bloquerCarte.mutate(membre.id_carte_active, { onSuccess: () => setConfirmAction(null) })
    } else if (confirmAction === 'reactiver') {
      activerCarte.mutate(membre.id_carte_active, { onSuccess: () => setConfirmAction(null) })
    }
  }

  function handleRenvoyerIdentifiants(email?: string) {
    if (!idMembre) return
    renvoyerIdentifiants.mutate(
      { idMembre, email },
      {
        onSuccess: () => setDemanderEmailOpen(false),
        onError: (error) => {
          if (apiErrorCode(error) === 'EMAIL_MANQUANT') setDemanderEmailOpen(true)
        },
      },
    )
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(next) => !next && onOpenChange(false)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Détail du membre</SheetTitle>
            <SheetDescription>Informations d'adhésion et gestion de la carte.</SheetDescription>
          </SheetHeader>

          {isLoading || !membre ? (
            <div className="mt-4 space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="mt-4 space-y-6">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    {membre.prenom} {membre.nom}
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                    <Pencil className="size-3.5 mr-1" />
                    Modifier
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{membre.email}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant={statutAdhesionMeta(membre.statut_adhesion).variant}>
                    {statutAdhesionMeta(membre.statut_adhesion).label}
                  </Badge>
                  {membre.statut_carte && (
                    <Badge variant={statutCarteMeta(membre.statut_carte).variant}>
                      Carte {statutCarteMeta(membre.statut_carte).label}
                    </Badge>
                  )}
                  {membre.est_admin_principal && <Badge variant="default">Admin principal</Badge>}
                  {!membre.est_admin_principal && membre.est_admin && <Badge variant="default">Admin</Badge>}
                  {membre.est_controleur && <Badge variant="outline">Contrôleur</Badge>}
                </div>
              </div>

              <Separator />

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">N° adhérent</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{membre.numero_adherent}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Fonction AP2A</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{membre.fonction_association_libelle}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Section</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{membre.section ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Date d'adhésion</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{formatDate(membre.date_adhesion)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Participations</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{membre.nombre_participations}</dd>
                </div>
              </dl>

              <Separator />

              <div>
                <h4 className="mb-2 text-sm font-medium text-foreground">Accès & Identifiants</h4>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={renvoyerIdentifiants.isPending}
                    onClick={() => handleRenvoyerIdentifiants()}
                  >
                    <Mail className="size-3.5 mr-1" />
                    {renvoyerIdentifiants.isPending ? 'Génération...' : 'Renvoyer les identifiants (Email)'}
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Génère un nouveau mot de passe temporaire et l'envoie automatiquement à l'adhérent s'il dispose d'une adresse email.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 text-sm font-medium text-foreground">Carte</h4>
                {!membre.id_carte_active ? (
                  <p className="text-sm text-muted-foreground">Aucune carte.</p>
                ) : membre.statut_carte === 'ACTIVE' ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setConfirmAction('bloquer')}
                  >
                    <CreditCard />
                    Bloquer la carte
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setConfirmAction('reactiver')}>
                    <CreditCard />
                    Réactiver la carte
                  </Button>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 text-sm font-medium text-foreground">Historique des cartes</h4>
                {membre.historique_cartes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun historique.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Émission</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {membre.historique_cartes.map((carte) => (
                        <TableRow key={carte.id_carte}>
                          <TableCell>{carte.type_carte}</TableCell>
                          <TableCell>
                            <Badge variant={statutCarteMeta(carte.statut_carte).variant}>
                              {statutCarteMeta(carte.statut_carte).label}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(carte.date_emission)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(next) => !next && setConfirmAction(null)}
        title={confirmAction === 'bloquer' ? 'Bloquer la carte' : 'Réactiver la carte'}
        description={
          confirmAction === 'bloquer'
            ? 'Le membre ne pourra plus utiliser sa carte tant qu\'elle ne sera pas réactivée.'
            : "La carte redevient utilisable immédiatement."
        }
        confirmLabel={confirmAction === 'bloquer' ? 'Bloquer' : 'Réactiver'}
        variant={confirmAction === 'bloquer' ? 'destructive' : 'default'}
        loading={bloquerCarte.isPending || activerCarte.isPending}
        onConfirm={handleConfirm}
      />

      <EditMembreDialog membre={membre ?? null} open={editOpen} onOpenChange={setEditOpen} />

      <DemanderEmailDialog
        open={demanderEmailOpen}
        onOpenChange={setDemanderEmailOpen}
        loading={renvoyerIdentifiants.isPending}
        onConfirm={(email) => handleRenvoyerIdentifiants(email)}
      />
    </>
  )
}
