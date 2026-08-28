import { useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  HandHeart,
  ListChecks,
  Pencil,
  Printer,
  Trash2,
  Upload,
  UserMinus,
  UserPlus,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
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
} from '@/components/ui'
import { ExcelImportModal } from '@/components/shared/ExcelImportModal'
import { useActionSocialeDetail, useImporterBeneficiairesExcel, useRetirerBeneficiaire, useSupprimerActionSociale, useBasculerDonRecu } from '@/lib/queries'
import { formatDate } from '@/lib/utils/format'
import { statutParticipationMeta, typeActionSocialeLabel } from '@/lib/utils/status'
import type { ActionSocialeDetail } from '@/lib/api/types'
import { AjouterBeneficiaireDialog } from './AjouterBeneficiaireDialog'
import { ModifierBeneficiaireDialog } from './ModifierBeneficiaireDialog'
import { SuiviParticipationDialog } from './SuiviParticipationDialog'
import { EditActionDialog } from './EditActionDialog'

type Beneficiaire = ActionSocialeDetail['beneficiaires'][number]
type ColonneTri = 'nom' | 'telephone' | 'statut'

function valeurTri(b: Beneficiaire, colonne: ColonneTri, typeAction?: string): string | number {
  switch (colonne) {
    case 'nom':
      return `${b.nom} ${b.prenom}`.toLowerCase()
    case 'telephone':
      return b.telephone ?? ''
    case 'statut':
      if (typeAction === 'DON') return b.don_recu ? 1 : 0
      if (typeAction === 'MEDICAL') return b.detail_medical?.a_ete_visite ? 1 : 0
      return b.statut ?? ''
    default:
      return ''
  }
}

function EnteteTriable({
  label,
  colonne,
  triActuel,
  onTri,
}: {
  label: string
  colonne: ColonneTri
  triActuel: { colonne: ColonneTri; direction: 'asc' | 'desc' } | null
  onTri: (colonne: ColonneTri) => void
}) {
  const actif = triActuel?.colonne === colonne
  const Icon = actif ? (triActuel!.direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onTri(colonne)}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        {label}
        <Icon className="size-3" />
      </button>
    </TableHead>
  )
}

interface ActionDetailPanelProps {
  idAction: number
}

export function ActionDetailPanel({ idAction }: ActionDetailPanelProps) {
  const [beneficiaireOpen, setBeneficiaireOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [supprimerActionOpen, setSupprimerActionOpen] = useState(false)
  const [editingBeneficiaire, setEditingBeneficiaire] = useState<Beneficiaire | null>(null)
  const [suiviBeneficiaire, setSuiviBeneficiaire] = useState<Beneficiaire | null>(null)
  const [retirantBeneficiaire, setRetirantBeneficiaire] = useState<Beneficiaire | null>(null)
  const [tri, setTri] = useState<{ colonne: ColonneTri; direction: 'asc' | 'desc' } | null>(null)

  const action = useActionSocialeDetail(idAction)
  const importerExcel = useImporterBeneficiairesExcel()
  const retirer = useRetirerBeneficiaire()
  const supprimerAction = useSupprimerActionSociale()
  const basculerDon = useBasculerDonRecu()

  async function handleRetirer() {
    if (!retirantBeneficiaire) return
    await retirer.mutateAsync({ idAction, idParticipation: retirantBeneficiaire.id_participation })
    setRetirantBeneficiaire(null)
  }

  async function handleDeleteAction() {
    await supprimerAction.mutateAsync(idAction)
    setSupprimerActionOpen(false)
  }

  function basculerTri(colonne: ColonneTri) {
    setTri((prev) => {
      if (prev?.colonne === colonne) {
        return prev.direction === 'asc' ? { colonne, direction: 'desc' as const } : null
      }
      return { colonne, direction: 'asc' as const }
    })
  }

  const beneficiairesTries = useMemo(() => {
    const liste = action.data?.beneficiaires ?? []
    if (!tri) return liste
    const typeAction = action.data?.type_action
    const copie = [...liste]
    copie.sort((a, b) => {
      const va = valeurTri(a, tri.colonne, typeAction)
      const vb = valeurTri(b, tri.colonne, typeAction)
      const cmp = va < vb ? -1 : va > vb ? 1 : 0
      return tri.direction === 'asc' ? cmp : -cmp
    })
    return copie
  }, [action.data?.beneficiaires, action.data?.type_action, tri])

  return (
    <div className="space-y-4">
      {action.isLoading && <Skeleton className="h-40 w-full" />}
      {!action.isLoading && action.data && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <CardTitle>{action.data.titre}</CardTitle>
                  <Badge variant="outline">{typeActionSocialeLabel[action.data.type_action] ?? action.data.type_action_libelle}</Badge>
                </div>
                {action.data.description && <p className="text-sm text-muted-foreground">{action.data.description}</p>}
                <p className="mt-2 text-xs text-muted-foreground">
                  {action.data.lieu ? `${action.data.lieu} · ` : ''}
                  {formatDate(action.data.date_debut)}
                  {action.data.date_fin ? ` → ${formatDate(action.data.date_fin)}` : ''}
                </p>
                <p className="text-xs text-muted-foreground">Organisateur : {action.data.organisateur}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 no-print">
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="size-3.5 mr-1" />
                  Imprimer
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                  <Pencil className="size-3.5 mr-1" />
                  Modifier
                </Button>
                <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                  <Upload className="size-3.5 mr-1" />
                  Importer Excel
                </Button>
                <Button size="sm" onClick={() => setBeneficiaireOpen(true)}>
                  <UserPlus className="size-3.5 mr-1" />
                  Ajouter un bénéficiaire
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setSupprimerActionOpen(true)}
                >
                  <Trash2 className="size-3.5 mr-1" />
                  Supprimer
                </Button>
              </div>
            </CardHeader>

            {action.data.type_action === 'DON' && (
              <div className="mx-6 mb-4 p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-sm">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 block mb-1">
                  🎁 Contenu & Nature des Dons :
                </span>
                <p className="text-emerald-800 dark:text-emerald-300">
                  {action.data.contenu_don || 'Dons en vivres, kits alimentaires ou aides spécifiques de l\'association.'}
                </p>
              </div>
            )}
          </Card>

          {action.data.beneficiaires.length === 0 ? (
            <EmptyState
              icon={HandHeart}
              title="Aucun bénéficiaire"
              description="Ajoutez ou importez des bénéficiaires pour cette action."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <EnteteTriable label="Nom & Prénom" colonne="nom" triActuel={tri} onTri={basculerTri} />
                  <EnteteTriable label="Téléphone" colonne="telephone" triActuel={tri} onTri={basculerTri} />
                  {action.data.type_action === 'DON' ? (
                    <>
                      <EnteteTriable label="Don Reçu (1-Clic)" colonne="statut" triActuel={tri} onTri={basculerTri} />
                      <TableHead>Date Réception</TableHead>
                    </>
                  ) : action.data.type_action === 'MEDICAL' ? (
                    <>
                      <EnteteTriable label="Visité" colonne="statut" triActuel={tri} onTri={basculerTri} />
                      <TableHead>Besoin Traitement</TableHead>
                      <TableHead>Traitement Effectué</TableHead>
                    </>
                  ) : (
                    <>
                      <EnteteTriable label="Statut" colonne="statut" triActuel={tri} onTri={basculerTri} />
                      <TableHead>Aide reçue</TableHead>
                    </>
                  )}
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right no-print">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beneficiairesTries.map((b) => {
                  const meta = statutParticipationMeta(b.statut as Parameters<typeof statutParticipationMeta>[0])
                  const isDon = action.data.type_action === 'DON'
                  const isMedical = action.data.type_action === 'MEDICAL'

                  return (
                    <TableRow key={b.id_beneficiaire}>
                      <TableCell className="font-medium">
                        {b.prenom} {b.nom}
                      </TableCell>
                      <TableCell>{b.telephone ?? '—'}</TableCell>

                      {isDon && (
                        <>
                          <TableCell>
                            <button
                              onClick={() => basculerDon.mutate({ idAction, idParticipation: b.id_participation })}
                              disabled={basculerDon.isPending}
                              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                                b.don_recu
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                              }`}
                            >
                              {b.don_recu ? '✓ Don Reçu' : 'Non reçu'}
                            </button>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {b.date_reception_don ? formatDate(b.date_reception_don) : '—'}
                          </TableCell>
                        </>
                      )}

                      {isMedical && (
                        <>
                          <TableCell>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                b.detail_medical?.a_ete_visite
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {b.detail_medical?.a_ete_visite ? 'Visité' : 'Non visité'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {b.detail_medical?.necessite_traitement ? (
                              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 block max-w-xs truncate" title={b.detail_medical?.description_besoin_traitement}>
                                ⚠️ {b.detail_medical?.description_besoin_traitement || 'Oui (Traitement requis)'}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">Non</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                b.detail_medical?.traitement_effectue
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              }`}
                            >
                              {b.detail_medical?.traitement_effectue ? '✓ Traité' : 'En attente'}
                            </span>
                          </TableCell>
                        </>
                      )}

                      {!isDon && !isMedical && (
                        <>
                          <TableCell>
                            <Badge variant={meta.variant}>{meta.label}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{b.type_aide_recue ?? '—'}</TableCell>
                        </>
                      )}

                      <TableCell className="max-w-xs truncate text-xs">{b.notes ?? '—'}</TableCell>
                      <TableCell className="no-print">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            title="Modifier l'identité"
                            onClick={() => setEditingBeneficiaire(b)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            title="Suivi"
                            onClick={() => setSuiviBeneficiaire(b)}
                          >
                            <ListChecks className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive hover:text-destructive disabled:opacity-30"
                            title={
                              b.don_recu
                                ? 'Impossible de supprimer un bénéficiaire ayant reçu son don (audit)'
                                : 'Retirer de cette action'
                            }
                            disabled={Boolean(b.don_recu)}
                            onClick={() => setRetirantBeneficiaire(b)}
                          >
                            <UserMinus className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          <AjouterBeneficiaireDialog
            open={beneficiaireOpen}
            onOpenChange={setBeneficiaireOpen}
            idAction={idAction}
            typeAction={action.data.type_action}
          />

          <ExcelImportModal
            open={importOpen}
            onOpenChange={setImportOpen}
            title="Importer des bénéficiaires"
            instructions="Le fichier Excel doit contenir les colonnes nom, prenom, telephone et les champs spécifiques au type d'action."
            onImport={(fichier) => importerExcel.mutateAsync({ idAction, fichier })}
            renderResult={(result) => (
              <div className="space-y-2">
                <p>{result.message}</p>
                <p className="font-medium">{result.crees} bénéficiaire(s) créé(s)</p>
                <p>{result.doublons} doublon(s) ignoré(s)</p>
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

          <ModifierBeneficiaireDialog
            open={Boolean(editingBeneficiaire)}
            onOpenChange={(open) => !open && setEditingBeneficiaire(null)}
            idAction={idAction}
            beneficiaire={editingBeneficiaire}
          />

          <SuiviParticipationDialog
            open={Boolean(suiviBeneficiaire)}
            onOpenChange={(open) => !open && setSuiviBeneficiaire(null)}
            idAction={idAction}
            typeAction={action.data.type_action}
            beneficiaire={suiviBeneficiaire}
          />

          <ConfirmDialog
            open={Boolean(retirantBeneficiaire)}
            onOpenChange={(open) => !open && setRetirantBeneficiaire(null)}
            title="Retirer le bénéficiaire"
            description="Le bénéficiaire sera retiré de cette action, mais son dossier reste disponible pour d'autres actions."
            confirmLabel="Retirer"
            variant="destructive"
            loading={retirer.isPending}
            onConfirm={handleRetirer}
          />

          {action.data && (
            <EditActionDialog
              open={editOpen}
              onOpenChange={setEditOpen}
              action={action.data}
            />
          )}

          <ConfirmDialog
            open={supprimerActionOpen}
            onOpenChange={setSupprimerActionOpen}
            title="Supprimer l'action sociale"
            description={`Êtes-vous sûr de vouloir supprimer définitivement l'action « ${action.data?.titre} » ? Toutes les participations associées seront supprimées.`}
            confirmLabel="Supprimer définitivement"
            variant="destructive"
            loading={supprimerAction.isPending}
            onConfirm={handleDeleteAction}
          />
        </>
      )}
    </div>
  )
}
