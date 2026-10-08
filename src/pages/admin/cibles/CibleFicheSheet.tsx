import { useState } from 'react'
import { GitMerge, History, Link2, Mail, MapPin, Pencil, Phone, Trash2, Users, X } from 'lucide-react'
import {
  Badge,
  Button,
  ConfirmDialog,
  Input,
  Label,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Skeleton,
  Switch,
} from '@/components/ui'
import {
  useAjouterAppartenance,
  useFicheCible,
  useFusionnerCibles,
  useModifierCible,
  useSupprimerAppartenance,
  useSupprimerCible,
} from '@/lib/queries'
import { formatDate } from '@/lib/utils/format'
import { typeCibleLabel } from '@/lib/utils/status'
import type { Cible, TypeCible } from '@/lib/api/types'
import { CibleDialog } from './CibleDialog'
import { CibleRecherche } from './CibleRecherche'
import { BesoinsCible } from './BesoinsCible'

const COLLECTIFS: TypeCible[] = ['GROUPE', 'ASC', 'ETABLISSEMENT', 'ORGANISATION', 'ZONE_SINISTREE']

interface CibleFicheSheetProps {
  idCible: number | null
  onOpenChange: (open: boolean) => void
  onOuvrir: (idCible: number) => void
}

/** Fiche d'une cible : informations, rattachements, historique des actions, fusion de doublon. */
export function CibleFicheSheet({ idCible, onOpenChange, onOuvrir }: CibleFicheSheetProps) {
  const fiche = useFicheCible(idCible)
  const modifier = useModifierCible()
  const supprimer = useSupprimerCible()
  const ajouterAppartenance = useAjouterAppartenance()
  const supprimerAppartenance = useSupprimerAppartenance()
  const fusionner = useFusionnerCibles()
  const [edition, setEdition] = useState(false)
  const [role, setRole] = useState('')
  const [doublonAFusionner, setDoublonAFusionner] = useState<Cible | null>(null)
  const [confirmerSuppression, setConfirmerSuppression] = useState(false)

  const cible = fiche.data
  const estPersonne = cible?.type_cible === 'PERSONNE'

  return (
    <>
      <Sheet open={idCible !== null} onOpenChange={(next) => !next && onOpenChange(false)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{cible?.nom_complet ?? 'Fiche cible'}</SheetTitle>
            <SheetDescription>
              {cible ? `${typeCibleLabel[cible.type_cible]}${cible.sous_type ? ` · ${cible.sous_type}` : ''}` : ' '}
            </SheetDescription>
          </SheetHeader>

          {fiche.isLoading || !cible ? (
            <div className="mt-4 space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="mt-4 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setEdition(true)}>
                  <Pencil className="size-3.5" />
                  Modifier
                </Button>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={cible.actif}
                    onCheckedChange={(actif) => modifier.mutate({ idCible: cible.id_cible, payload: { actif } })}
                  />
                  Active
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-destructive hover:text-destructive"
                  onClick={() => setConfirmerSuppression(true)}
                >
                  <Trash2 className="size-3.5" />
                  Supprimer
                </Button>
              </div>

              <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-1.5 text-sm">
                {estPersonne && (
                  <>
                    <dt className="text-muted-foreground">Sexe</dt>
                    <dd>{cible.sexe === 'F' ? 'Féminin' : cible.sexe === 'M' ? 'Masculin' : '—'}</dd>
                    <dt className="text-muted-foreground">Naissance</dt>
                    <dd>{cible.date_naissance ? formatDate(cible.date_naissance) : '—'}</dd>
                    <dt className="text-muted-foreground">Pièce d'identité</dt>
                    <dd>{cible.numero_identification || '—'}</dd>
                    {cible.membre_numero_adherent && (
                      <>
                        <dt className="text-muted-foreground">Membre AP2A</dt>
                        <dd>{cible.membre_numero_adherent}</dd>
                      </>
                    )}
                  </>
                )}
                {!estPersonne && (
                  <>
                    <dt className="text-muted-foreground">Responsable</dt>
                    <dd>{cible.responsable || '—'}</dd>
                    <dt className="text-muted-foreground">Effectif</dt>
                    <dd>{cible.effectif ?? '—'}</dd>
                  </>
                )}
              </dl>

              <div className="space-y-1 text-sm text-muted-foreground">
                {cible.zone_chemin && (
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    {cible.zone_chemin}
                    {cible.adresse ? ` · ${cible.adresse}` : ''}
                  </p>
                )}
                {cible.telephone && (
                  <p className="flex items-center gap-2">
                    <Phone className="size-4" />
                    {cible.telephone}
                  </p>
                )}
                {cible.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="size-4" />
                    {cible.email}
                  </p>
                )}
              </div>
              {cible.notes && <p className="whitespace-pre-line rounded-md bg-muted/50 p-3 text-sm">{cible.notes}</p>}

              <Separator />

              <BesoinsCible cible={cible} />

              <Separator />

              <section className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="size-4" />
                  {estPersonne ? 'Fait partie de' : 'Membres / personnes rattachées'} ({cible.appartenances.length})
                </h3>
                {cible.appartenances.map((a) => (
                  <div key={a.id_appartenance} className="flex items-center justify-between gap-2 rounded-md border px-3 py-1.5">
                    <button type="button" className="min-w-0 text-left text-sm hover:underline" onClick={() => onOuvrir(a.cible.id_cible)}>
                      <span className="block truncate">{a.cible.nom_complet}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {[a.role, typeCibleLabel[a.cible.type_cible]].filter(Boolean).join(' · ')}
                      </span>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      aria-label="Retirer le rattachement"
                      onClick={() => supprimerAppartenance.mutate(a.id_appartenance)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ))}
                <div className="space-y-1.5 rounded-md border border-dashed p-3">
                  <Label className="flex items-center gap-1.5 text-xs">
                    <Link2 className="size-3.5" />
                    {estPersonne ? 'Rattacher à un groupe, une ASC, une école…' : 'Rattacher une personne'}
                  </Label>
                  <Input placeholder="Rôle (facultatif) : présidente, élève…" value={role} onChange={(e) => setRole(e.target.value)} />
                  <CibleRecherche
                    types={estPersonne ? COLLECTIFS : ['PERSONNE']}
                    exclure={[cible.id_cible, ...cible.appartenances.map((a) => a.cible.id_cible)]}
                    placeholder={estPersonne ? 'Rechercher le collectif…' : 'Rechercher la personne…'}
                    onChoisir={(autre) =>
                      ajouterAppartenance.mutate(
                        { idCible: cible.id_cible, idAutre: autre.id_cible, role },
                        { onSuccess: () => setRole('') },
                      )
                    }
                  />
                </div>
              </section>

              <Separator />

              <section className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <History className="size-4" />
                  Historique des actions ({cible.historique.length})
                </h3>
                {cible.historique.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucune action pour l'instant.</p>
                )}
                <ol className="space-y-2 border-l pl-4">
                  {cible.historique.map((e) => (
                    <li key={`${e.nature}-${e.id}`} className="relative text-sm">
                      <span className="absolute -left-[1.3rem] top-1.5 size-2 rounded-full bg-primary" />
                      <p className="font-medium">{e.titre}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.type} · {e.date ? formatDate(e.date) : '—'}
                      </p>
                      <Badge variant="secondary" className="mt-0.5">
                        {e.statut}
                      </Badge>
                    </li>
                  ))}
                </ol>
              </section>

              <Separator />

              <section className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <GitMerge className="size-4" />
                  Fusionner un doublon
                </h3>
                <p className="text-xs text-muted-foreground">
                  Si cette {estPersonne ? 'personne' : 'cible'} a été enregistrée deux fois, choisissez l'autre fiche : ses
                  informations, rattachements et historique seront repris ici, puis elle sera supprimée.
                </p>
                <CibleRecherche
                  types={[cible.type_cible]}
                  exclure={[cible.id_cible]}
                  placeholder="Rechercher le doublon…"
                  onChoisir={setDoublonAFusionner}
                />
              </section>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {cible && (
        <CibleDialog open={edition} onOpenChange={setEdition} cible={cible} />
      )}

      <ConfirmDialog
        open={Boolean(doublonAFusionner)}
        onOpenChange={(open) => !open && setDoublonAFusionner(null)}
        title="Fusionner les deux fiches"
        description={`« ${doublonAFusionner?.nom_complet ?? ''} » sera fusionné(e) dans « ${cible?.nom_complet ?? ''} » puis supprimé(e). Cette opération est définitive.`}
        confirmLabel="Fusionner"
        variant="destructive"
        loading={fusionner.isPending}
        onConfirm={async () => {
          if (!cible || !doublonAFusionner) return
          try {
            await fusionner.mutateAsync({ idCible: cible.id_cible, idDoublon: doublonAFusionner.id_cible })
          } catch {
            // toast déjà affiché
          } finally {
            setDoublonAFusionner(null)
          }
        }}
      />

      <ConfirmDialog
        open={confirmerSuppression}
        onOpenChange={setConfirmerSuppression}
        title="Supprimer la cible"
        description={`Supprimer « ${cible?.nom_complet ?? ''} » ? Une cible qui a déjà bénéficié d'actions ne peut pas être supprimée : désactivez-la plutôt.`}
        confirmLabel="Supprimer"
        variant="destructive"
        loading={supprimer.isPending}
        onConfirm={async () => {
          if (!cible) return
          try {
            await supprimer.mutateAsync(cible.id_cible)
            onOpenChange(false)
          } catch {
            // toast déjà affiché
          } finally {
            setConfirmerSuppression(false)
          }
        }}
      />
    </>
  )
}
