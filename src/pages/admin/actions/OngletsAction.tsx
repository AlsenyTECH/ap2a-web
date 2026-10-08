import { useState } from 'react'
import { Check, Plus, Trash2, UserCheck, UserX, X } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '@/components/ui'
import { MemberMultiSelect } from '@/components/shared/MemberMultiSelect'
import { useMutationFiche, usePartenaires } from '@/lib/queries'
import { actionsApi } from '@/lib/api/actions'
import { formatDate, formatMoney } from '@/lib/utils/format'
import {
  phaseTacheLabel,
  rolePartenaireLabel,
  statutActionCibleMeta,
  statutEquipeMeta,
  typeCibleLabel,
  typePartenaireLabel,
} from '@/lib/utils/status'
import type { ActionCibleLigne, ActionFiche, PhaseTache, RolePartenaire, StatutActionCible } from '@/lib/api/types'
import { CibleRecherche } from '../cibles/CibleRecherche'
import { formaterValeur } from './ChampIndicateur'
import { SaisieIndicateursDialog } from './SaisieIndicateursDialog'

interface OngletProps {
  action: ActionFiche
}

const cloturee = (a: ActionFiche) => a.statut === 'TERMINEE' || a.statut === 'ANNULEE'

// ---------------------------------------------------------------------
// Cibles : qui est concerné, qui a été servi, indicateurs par cible
// ---------------------------------------------------------------------

export function OngletCibles({ action }: OngletProps) {
  const id = action.id_action
  const ajouter = useMutationFiche(id, (cibles: number[]) => actionsApi.ajouterCibles(id, { cibles }), 'Cible ajoutée')
  const modifier = useMutationFiche(id, ({ ligne, statut }: { ligne: number; statut: StatutActionCible }) =>
    actionsApi.modifierCible(ligne, { statut }))
  const retirer = useMutationFiche(id, (ligne: number) => actionsApi.retirerCible(ligne), 'Cible retirée')
  const enLot = useMutationFiche(id, (ids: number[]) => actionsApi.statutCiblesLot(id, ids, 'SERVIE'), 'Cibles marquées servies')
  const [selection, setSelection] = useState<number[]>([])
  const [saisie, setSaisie] = useState<ActionCibleLigne | null>(null)
  const indicateursCible = action.indicateurs.filter((i) => i.niveau === 'CIBLE')
  const resumeIndicateurs = indicateursCible.filter((i) => i.moment === 'INTERVENTION').slice(0, 2)

  function basculer(idLigne: number) {
    setSelection((s) => (s.includes(idLigne) ? s.filter((x) => x !== idLigne) : [...s, idLigne]))
  }

  return (
    <div className="space-y-4">
      {!cloturee(action) && (
        <div className="space-y-1.5">
          <Label>Ajouter une cible ({action.types_cible.map((t) => typeCibleLabel[t]).join(', ')})</Label>
          <CibleRecherche
            types={action.types_cible}
            exclure={action.cibles.map((c) => c.id_cible)}
            onChoisir={(c) => ajouter.mutate([c.id_cible])}
          />
        </div>
      )}

      {action.cibles.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune cible pour l'instant.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selection.length === action.cibles.length}
                onCheckedChange={(c) => setSelection(c ? action.cibles.map((l) => l.id_action_cible) : [])}
              />
              Tout sélectionner
            </label>
            {selection.length > 0 && (
              <Button
                size="sm"
                onClick={() => enLot.mutate(selection, { onSuccess: () => setSelection([]) })}
                disabled={enLot.isPending}
              >
                <Check className="size-4" />
                Marquer {selection.length} servie(s)
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {action.cibles.map((l) => {
              const meta = statutActionCibleMeta(l.statut)
              return (
                <Card key={l.id_action_cible}>
                  <CardContent className="space-y-2 p-3">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        className="mt-0.5"
                        checked={selection.includes(l.id_action_cible)}
                        onCheckedChange={() => basculer(l.id_action_cible)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{l.nom_complet}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {[typeCibleLabel[l.type_cible], l.zone_chemin, l.telephone].filter(Boolean).join(' · ')}
                        </p>
                        {l.besoin && <p className="truncate text-xs">Besoin : {l.besoin}</p>}
                      </div>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </div>
                    {resumeIndicateurs.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {resumeIndicateurs.map((i) => `${i.libelle} : ${formaterValeur(i, l.valeurs[i.id_indicateur])}`).join(' · ')}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {!cloturee(action) && l.statut !== 'SERVIE' && (
                        <Button size="sm" variant="outline" onClick={() => modifier.mutate({ ligne: l.id_action_cible, statut: 'SERVIE' })}>
                          <Check className="size-3.5" />
                          Servie
                        </Button>
                      )}
                      {!cloturee(action) && l.statut !== 'ABSENTE' && (
                        <Button size="sm" variant="ghost" onClick={() => modifier.mutate({ ligne: l.id_action_cible, statut: 'ABSENTE' })}>
                          Absente
                        </Button>
                      )}
                      {indicateursCible.length > 0 && (
                        <Button size="sm" variant="secondary" onClick={() => setSaisie(l)}>
                          Indicateurs
                        </Button>
                      )}
                      {!cloturee(action) && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="ml-auto size-8 text-destructive hover:text-destructive"
                          aria-label="Retirer la cible"
                          onClick={() => retirer.mutate(l.id_action_cible)}
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}

      <SaisieIndicateursDialog action={action} ligne={saisie} open={saisie !== null} onOpenChange={(o) => !o && setSaisie(null)} />
    </div>
  )
}

// ---------------------------------------------------------------------
// Équipe : membres affectés ou volontaires, rôles, présence
// ---------------------------------------------------------------------

export function OngletEquipe({ action }: OngletProps) {
  const id = action.id_action
  const [membres, setMembres] = useState<number[]>([])
  const [role, setRole] = useState('')
  const affecter = useMutationFiche(id, () => actionsApi.affecterMembres(id, membres, role), 'Membres affectés (notifiés)')
  const modifier = useMutationFiche(id, ({ ligne, ...p }: { ligne: number; statut?: 'CONFIRME' | 'DECLINE'; present?: boolean }) =>
    actionsApi.modifierEquipier(ligne, p))
  const retirer = useMutationFiche(id, (ligne: number) => actionsApi.retirerEquipier(ligne), "Retiré de l'équipe")
  const confirmes = action.equipe.filter((e) => e.statut === 'CONFIRME').length

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="text-sm font-medium">Affecter des membres</p>
          <MemberMultiSelect selectedIds={membres} onChange={setMembres} />
          <Input placeholder="Rôle (facultatif) : logistique, accueil, animation…" value={role} onChange={(e) => setRole(e.target.value)} />
          <Button
            disabled={membres.length === 0 || affecter.isPending}
            onClick={() => affecter.mutate(undefined, { onSuccess: () => { setMembres([]); setRole('') } })}
          >
            <Plus className="size-4" />
            Affecter {membres.length || ''} membre(s)
          </Button>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        {confirmes} membre(s) confirmé(s)
        {action.volontaires_souhaites ? ` sur ${action.volontaires_souhaites} souhaité(s)` : ''}
        {action.appel_volontaires ? ' · appel à volontaires ouvert' : ''}
      </p>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {action.equipe.map((e) => {
          const meta = statutEquipeMeta(e.statut)
          return (
            <Card key={e.id_membre_equipe}>
              <CardContent className="space-y-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{e.nom}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[e.role, e.numero_adherent, e.telephone, e.volontaire ? 'volontaire' : null].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {e.statut === 'PROPOSE' && (
                    <>
                      <Button size="sm" onClick={() => modifier.mutate({ ligne: e.id_membre_equipe, statut: 'CONFIRME' })}>
                        <UserCheck className="size-3.5" />
                        Retenir
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => modifier.mutate({ ligne: e.id_membre_equipe, statut: 'DECLINE' })}>
                        <UserX className="size-3.5" />
                        Décliner
                      </Button>
                    </>
                  )}
                  {e.statut === 'CONFIRME' && (
                    <label className="flex items-center gap-2 text-xs">
                      <Switch
                        checked={e.present === true}
                        onCheckedChange={(present) => modifier.mutate({ ligne: e.id_membre_equipe, present })}
                      />
                      Présent le jour J
                    </label>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="ml-auto size-8 text-destructive hover:text-destructive"
                    aria-label="Retirer de l'équipe"
                    onClick={() => retirer.mutate(e.id_membre_equipe)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// Tâches avant / pendant / après
// ---------------------------------------------------------------------

const PHASES: PhaseTache[] = ['AVANT', 'PENDANT', 'APRES']

export function OngletTaches({ action }: OngletProps) {
  const id = action.id_action
  const [titre, setTitre] = useState('')
  const [phase, setPhase] = useState<PhaseTache>('AVANT')
  const [echeance, setEcheance] = useState('')
  const ajouter = useMutationFiche(id, () => actionsApi.ajouterTache(id, { titre, phase, echeance: echeance || null }))
  const cocher = useMutationFiche(id, ({ tache, faite }: { tache: number; faite: boolean }) => actionsApi.modifierTache(tache, { faite }))
  const supprimer = useMutationFiche(id, (tache: number) => actionsApi.supprimerTache(tache))

  return (
    <div className="space-y-5">
      <form
        className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_11rem_10rem_auto]"
        onSubmit={(e) => {
          e.preventDefault()
          if (titre.trim()) ajouter.mutate(undefined, { onSuccess: () => { setTitre(''); setEcheance('') } })
        }}
      >
        <Input placeholder="Nouvelle tâche : réserver la salle, acheter les kits…" value={titre} onChange={(e) => setTitre(e.target.value)} />
        <Select value={phase} onValueChange={(p) => setPhase(p as PhaseTache)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PHASES.map((p) => (
              <SelectItem key={p} value={p}>
                {phaseTacheLabel[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" value={echeance} onChange={(e) => setEcheance(e.target.value)} aria-label="Échéance" />
        <Button type="submit" disabled={!titre.trim() || ajouter.isPending}>
          <Plus className="size-4" />
          Ajouter
        </Button>
      </form>

      {PHASES.map((p) => {
        const taches = action.taches.filter((t) => t.phase === p)
        return (
          <section key={p} className="space-y-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {phaseTacheLabel[p]} ({taches.filter((t) => t.faite).length}/{taches.length})
            </h3>
            {taches.length === 0 && <p className="text-xs text-muted-foreground">Aucune tâche.</p>}
            {taches.map((t) => (
              <div key={t.id_tache} className="flex items-center gap-3 rounded-md border px-3 py-2">
                <Checkbox checked={t.faite} onCheckedChange={(c) => cocher.mutate({ tache: t.id_tache, faite: Boolean(c) })} />
                <div className="min-w-0 flex-1">
                  <p className={t.faite ? 'text-sm text-muted-foreground line-through' : 'text-sm'}>{t.titre}</p>
                  {(t.echeance || t.responsable) && (
                    <p className="text-xs text-muted-foreground">
                      {[t.echeance ? `avant le ${formatDate(t.echeance)}` : null, t.responsable].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <Button size="icon" variant="ghost" className="size-7" aria-label="Supprimer" onClick={() => supprimer.mutate(t.id_tache)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </section>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------
// Partenaires de l'action
// ---------------------------------------------------------------------

export function OngletPartenaires({ action }: OngletProps) {
  const id = action.id_action
  const partenaires = usePartenaires()
  const [idPartenaire, setIdPartenaire] = useState('')
  const [role, setRole] = useState<RolePartenaire>('PRESTATAIRE')
  const [montant, setMontant] = useState('')
  const ajouter = useMutationFiche(id, () =>
    actionsApi.ajouterPartenaire(id, { partenaire: Number(idPartenaire), role, montant_apport: montant ? Number(montant) : null }),
    'Partenaire ajouté')
  const retirer = useMutationFiche(id, (lien: number) => actionsApi.retirerPartenaire(lien), 'Partenaire retiré')
  const disponibles = (partenaires.data ?? []).filter((p) => !action.partenaires.some((ap) => ap.id_partenaire === p.id_partenaire))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_14rem_9rem_auto]">
        <Select value={idPartenaire} onValueChange={setIdPartenaire}>
          <SelectTrigger>
            <SelectValue placeholder="Partenaire…" />
          </SelectTrigger>
          <SelectContent>
            {disponibles.map((p) => (
              <SelectItem key={p.id_partenaire} value={String(p.id_partenaire)}>
                {p.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={role} onValueChange={(r) => setRole(r as RolePartenaire)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(rolePartenaireLabel).map(([code, libelle]) => (
              <SelectItem key={code} value={code}>
                {libelle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="number" min={0} placeholder="Apport FCFA" value={montant} onChange={(e) => setMontant(e.target.value)} />
        <Button
          disabled={!idPartenaire || ajouter.isPending}
          onClick={() => ajouter.mutate(undefined, { onSuccess: () => { setIdPartenaire(''); setMontant('') } })}
        >
          <Plus className="size-4" />
          Ajouter
        </Button>
      </div>
      {disponibles.length === 0 && action.partenaires.length === 0 && (
        <p className="text-xs text-muted-foreground">Ajoutez d'abord vos partenaires dans Référentiels & Partenaires.</p>
      )}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {action.partenaires.map((p) => (
          <Card key={p.id_action_partenaire}>
            <CardContent className="flex items-start justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.nom}</p>
                <p className="text-xs text-muted-foreground">
                  {rolePartenaireLabel[p.role]} · {typePartenaireLabel[p.type_partenaire]}
                  {p.montant_apport ? ` · ${formatMoney(p.montant_apport)}` : ''}
                </p>
              </div>
              <Button size="icon" variant="ghost" className="size-7" aria-label="Retirer" onClick={() => retirer.mutate(p.id_action_partenaire)}>
                <X className="size-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// Bilan : indicateurs de l'action entière, budget réalisé, texte de bilan
// ---------------------------------------------------------------------

export function OngletBilan({ action }: OngletProps) {
  const id = action.id_action
  const [bilan, setBilan] = useState(action.bilan)
  const [budget, setBudget] = useState(action.budget_realise ? String(Number(action.budget_realise)) : '')
  const [saisie, setSaisie] = useState(false)
  const enregistrer = useMutationFiche(id, () =>
    actionsApi.modifier(id, { bilan, budget_realise: budget === '' ? null : Number(budget) }), 'Bilan enregistré')
  const indicateursAction = action.indicateurs.filter((i) => i.niveau === 'ACTION')
  const servies = action.cibles.filter((c) => c.statut === 'SERVIE').length

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Cibles servies</p>
            <p className="text-2xl font-semibold">
              {servies} / {action.cibles.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Membres mobilisés</p>
            <p className="text-2xl font-semibold">{action.equipe.filter((e) => e.present).length || action.nombre_equipe}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Budget prévu / réalisé</p>
            <p className="text-lg font-semibold">
              {action.budget_prevu ? formatMoney(action.budget_prevu) : '—'} / {action.budget_realise ? formatMoney(action.budget_realise) : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {indicateursAction.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Indicateurs de l'action</h3>
            <Button size="sm" variant="secondary" onClick={() => setSaisie(true)}>
              Saisir
            </Button>
          </div>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
            {indicateursAction.map((i) => (
              <div key={i.id_indicateur} className="flex justify-between gap-2 border-b py-1">
                <dt className="text-muted-foreground">{i.libelle}</dt>
                <dd className="font-medium">{formaterValeur(i, action.valeurs_action[i.id_indicateur])}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="space-y-2">
        <Label htmlFor="bilan-budget">Budget réalisé (FCFA)</Label>
        <Input id="bilan-budget" type="number" min={0} value={budget} onChange={(e) => setBudget(e.target.value)} className="max-w-xs" />
        <Label htmlFor="bilan-texte">Bilan : ce qui a été fait, difficultés, leçons, suite à donner</Label>
        <Textarea id="bilan-texte" rows={6} value={bilan} onChange={(e) => setBilan(e.target.value)} />
        <Button onClick={() => enregistrer.mutate(undefined)} disabled={enregistrer.isPending}>
          Enregistrer le bilan
        </Button>
      </section>

      <SaisieIndicateursDialog action={action} ligne={null} open={saisie} onOpenChange={setSaisie} />
    </div>
  )
}
