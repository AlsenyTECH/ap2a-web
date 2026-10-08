import { useState } from 'react'
import { GraduationCap, ListChecks, Lock, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  ConfirmDialog,
  EmptyState,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import {
  useModifierIndicateur,
  useModifierTypeAction,
  useSupprimerIndicateur,
  useSupprimerTypeAction,
  useTypesAction,
} from '@/lib/queries'
import { cn } from '@/lib/utils'
import {
  categorieActionLabel,
  momentIndicateurLabel,
  niveauIndicateurLabel,
  typeCibleLabel,
  typeValeurLabel,
} from '@/lib/utils/status'
import type { DefinitionIndicateur, MomentIndicateur, TypeAction } from '@/lib/api/types'
import { TypeActionDialog } from './TypeActionDialog'
import { IndicateurDialog } from './IndicateurDialog'

const MOMENTS: MomentIndicateur[] = ['REFERENCE', 'INTERVENTION', 'SUIVI']

export function TypesActionTab() {
  const types = useTypesAction(true)
  const [idSelection, setIdSelection] = useState<number | null>(null)
  const [dialogueType, setDialogueType] = useState<{ ouvert: boolean; type: TypeAction | null }>({ ouvert: false, type: null })
  const [dialogueIndicateur, setDialogueIndicateur] = useState<{ ouvert: boolean; indicateur: DefinitionIndicateur | null }>({
    ouvert: false,
    indicateur: null,
  })
  const [typeASupprimer, setTypeASupprimer] = useState<TypeAction | null>(null)
  const [indicateurASupprimer, setIndicateurASupprimer] = useState<DefinitionIndicateur | null>(null)
  const modifierType = useModifierTypeAction()
  const supprimerType = useSupprimerTypeAction()
  const modifierIndicateur = useModifierIndicateur()
  const supprimerIndicateur = useSupprimerIndicateur()

  const selection = types.data?.find((t) => t.id_type_action === idSelection) ?? types.data?.[0] ?? null

  if (types.isLoading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
      <div className="space-y-2">
        <Button className="w-full" onClick={() => setDialogueType({ ouvert: true, type: null })}>
          <Plus className="size-4" />
          Nouveau type d'action
        </Button>
        {types.data?.map((t) => (
          <button
            key={t.id_type_action}
            type="button"
            onClick={() => setIdSelection(t.id_type_action)}
            className={cn(
              'w-full rounded-md border px-3 py-2 text-left transition-colors hover:bg-muted/50',
              selection?.id_type_action === t.id_type_action && 'border-primary bg-primary/5',
              !t.actif && 'opacity-60',
            )}
          >
            <p className="text-sm font-medium text-foreground">{t.libelle}</p>
            <p className="text-xs text-muted-foreground">
              {categorieActionLabel[t.categorie]} · {t.indicateurs.length} indicateur(s)
            </p>
          </button>
        ))}
      </div>

      {!selection ? (
        <EmptyState icon={ListChecks} title="Aucun type d'action" description="Créez le premier type d'action." />
      ) : (
        <Card>
          <CardContent className="space-y-5 pt-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
                  {selection.libelle}
                  {selection.est_formation && (
                    <Badge variant="secondary">
                      <GraduationCap className="mr-1 size-3" />
                      Formation
                    </Badge>
                  )}
                </h2>
                {selection.description && <p className="text-sm text-muted-foreground">{selection.description}</p>}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selection.types_cible.map((c) => (
                    <Badge key={c} variant="outline">
                      {typeCibleLabel[c]}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={selection.actif}
                    onCheckedChange={(actif) =>
                      modifierType.mutate({ idTypeAction: selection.id_type_action, payload: { actif } })
                    }
                  />
                  Actif
                </label>
                <Button variant="outline" size="sm" onClick={() => setDialogueType({ ouvert: true, type: selection })}>
                  <Pencil className="size-3.5" />
                  Modifier
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive"
                  aria-label="Supprimer le type d'action"
                  onClick={() => setTypeASupprimer(selection)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Indicateurs de suivi</h3>
              <Button size="sm" onClick={() => setDialogueIndicateur({ ouvert: true, indicateur: null })}>
                <Plus className="size-3.5" />
                Indicateur
              </Button>
            </div>

            {selection.indicateurs.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun indicateur : ajoutez ce que l'association veut mesurer.</p>
            )}

            {MOMENTS.map((moment) => {
              const indicateurs = selection.indicateurs.filter((i) => i.moment === moment)
              if (indicateurs.length === 0) return null
              return (
                <div key={moment} className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {momentIndicateurLabel[moment]}
                  </p>
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Indicateur</TableHead>
                          <TableHead>Valeur</TableHead>
                          <TableHead>Niveau</TableHead>
                          <TableHead className="w-28">Actif</TableHead>
                          <TableHead className="w-20" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {indicateurs.map((i) => (
                          <TableRow key={i.id_indicateur} className={i.actif ? undefined : 'opacity-60'}>
                            <TableCell>
                              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                                {i.libelle}
                                {i.obligatoire && <Badge variant="outline">Obligatoire</Badge>}
                                {i.sensible && (
                                  <Badge variant="warning">
                                    <Lock className="mr-1 size-3" />
                                    Médical
                                  </Badge>
                                )}
                              </div>
                              {i.type_valeur === 'CHOIX' && (
                                <p className="text-xs text-muted-foreground">{i.choix.join(' · ')}</p>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {typeValeurLabel[i.type_valeur]}
                              {i.unite ? ` (${i.unite})` : ''}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{niveauIndicateurLabel[i.niveau]}</TableCell>
                            <TableCell>
                              <Switch
                                checked={i.actif}
                                aria-label="Indicateur actif"
                                onCheckedChange={(actif) =>
                                  modifierIndicateur.mutate({ idIndicateur: i.id_indicateur, payload: { actif } })
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7"
                                  aria-label="Modifier l'indicateur"
                                  onClick={() => setDialogueIndicateur({ ouvert: true, indicateur: i })}
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-destructive hover:text-destructive"
                                  aria-label="Supprimer l'indicateur"
                                  onClick={() => setIndicateurASupprimer(i)}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <TypeActionDialog
        open={dialogueType.ouvert}
        typeAction={dialogueType.type}
        onOpenChange={(ouvert) => setDialogueType((d) => ({ ...d, ouvert }))}
        onCree={(t) => setIdSelection(t.id_type_action)}
      />
      {selection && (
        <IndicateurDialog
          open={dialogueIndicateur.ouvert}
          typeAction={selection}
          indicateur={dialogueIndicateur.indicateur}
          onOpenChange={(ouvert) => setDialogueIndicateur((d) => ({ ...d, ouvert }))}
        />
      )}

      <ConfirmDialog
        open={Boolean(typeASupprimer)}
        onOpenChange={(open) => !open && setTypeASupprimer(null)}
        title="Supprimer le type d'action"
        description={`Supprimer « ${typeASupprimer?.libelle ?? ''} » et ses indicateurs ? S'il est déjà utilisé, désactivez-le plutôt.`}
        confirmLabel="Supprimer"
        variant="destructive"
        loading={supprimerType.isPending}
        onConfirm={async () => {
          if (!typeASupprimer) return
          try {
            await supprimerType.mutateAsync(typeASupprimer.id_type_action)
            setIdSelection(null)
          } catch {
            // toast déjà affiché
          } finally {
            setTypeASupprimer(null)
          }
        }}
      />
      <ConfirmDialog
        open={Boolean(indicateurASupprimer)}
        onOpenChange={(open) => !open && setIndicateurASupprimer(null)}
        title="Supprimer l'indicateur"
        description={`Supprimer « ${indicateurASupprimer?.libelle ?? ''} » ? S'il a déjà des valeurs saisies, désactivez-le plutôt.`}
        confirmLabel="Supprimer"
        variant="destructive"
        loading={supprimerIndicateur.isPending}
        onConfirm={async () => {
          if (!indicateurASupprimer) return
          try {
            await supprimerIndicateur.mutateAsync(indicateurASupprimer.id_indicateur)
          } catch {
            // toast déjà affiché
          } finally {
            setIndicateurASupprimer(null)
          }
        }}
      />
    </div>
  )
}
