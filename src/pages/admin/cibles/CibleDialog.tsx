import { useEffect, useState } from 'react'
import { AlertTriangle, Loader2, UserRoundPlus } from 'lucide-react'
import { toast } from 'sonner'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui'
import { useCreerCible, useModifierCible } from '@/lib/queries'
import { apiErrorMessage } from '@/lib/api/client'
import { doublonsDepuisErreur, type CiblePayload } from '@/lib/api/cibles'
import { typeCibleLabel } from '@/lib/utils/status'
import type { Cible, DoublonPotentiel, TypeCible } from '@/lib/api/types'
import { ZoneSelect } from '../referentiels/ZoneSelect'

const AIDE_SOUS_TYPE: Record<TypeCible, string> = {
  PERSONNE: '',
  GROUPE: 'GIE, groupement de femmes, groupe de jeunes…',
  ASC: 'Football, culture…',
  ETABLISSEMENT: 'École élémentaire, collège, daara, poste de santé…',
  ORGANISATION: 'Association, coopérative, mairie…',
  ZONE_SINISTREE: 'Inondations 2026, incendie…',
}

const LIBELLE_EFFECTIF: Record<TypeCible, string> = {
  PERSONNE: '',
  GROUPE: 'Nombre de membres',
  ASC: 'Nombre de membres',
  ETABLISSEMENT: "Effectif (élèves, patients…)",
  ORGANISATION: 'Nombre de membres',
  ZONE_SINISTREE: "Population touchée (estimation)",
}

function valeursInitiales(type: TypeCible): CiblePayload {
  return {
    type_cible: type,
    nom: '',
    prenom: '',
    sexe: '',
    date_naissance: null,
    numero_identification: '',
    sous_type: '',
    responsable: '',
    effectif: null,
    telephone: '',
    email: '',
    zone: null,
    adresse: '',
    notes: '',
  }
}

interface CibleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Modification si fournie, sinon création. */
  cible?: Cible | null
  typeInitial?: TypeCible
  onEnregistree?: (idCible: number) => void
  onOuvrirExistante?: (idCible: number) => void
}

export function CibleDialog({ open, onOpenChange, cible, typeInitial = 'PERSONNE', onEnregistree, onOuvrirExistante }: CibleDialogProps) {
  const creer = useCreerCible()
  const modifier = useModifierCible()
  const [valeurs, setValeurs] = useState<CiblePayload>(valeursInitiales(typeInitial))
  const [zoneChemin, setZoneChemin] = useState<string | null>(null)
  const [doublons, setDoublons] = useState<DoublonPotentiel[] | null>(null)

  useEffect(() => {
    if (!open) return
    if (cible) {
      setValeurs({
        ...valeursInitiales(cible.type_cible),
        ...Object.fromEntries(Object.keys(valeursInitiales(cible.type_cible)).map((k) => [k, cible[k as keyof Cible]])),
      })
      setZoneChemin(cible.zone_chemin)
    } else {
      setValeurs(valeursInitiales(typeInitial))
      setZoneChemin(null)
    }
    setDoublons(null)
  }, [open, cible, typeInitial])

  const type = valeurs.type_cible as TypeCible
  const estPersonne = type === 'PERSONNE'

  function champ<K extends keyof CiblePayload>(cle: K, valeur: CiblePayload[K]) {
    setValeurs((v) => ({ ...v, [cle]: valeur }))
    setDoublons(null)
  }

  async function enregistrer(forcer = false) {
    try {
      if (cible) {
        await modifier.mutateAsync({ idCible: cible.id_cible, payload: valeurs })
        onEnregistree?.(cible.id_cible)
      } else {
        const creee = await creer.mutateAsync({ ...valeurs, forcer })
        onEnregistree?.(creee.id_cible)
      }
      onOpenChange(false)
    } catch (error) {
      const trouves = doublonsDepuisErreur(error)
      if (trouves) setDoublons(trouves)
      else if (!cible) toast.error(apiErrorMessage(error))
    }
  }

  const enCours = creer.isPending || modifier.isPending
  const incomplet = !valeurs.nom?.trim() || (estPersonne && !valeurs.prenom?.trim())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRoundPlus className="size-4 text-primary" />
            {cible ? `Modifier : ${cible.nom_complet}` : 'Nouvelle cible'}
          </DialogTitle>
          <DialogDescription>
            Personne, groupe, ASC, établissement, organisation ou zone sinistrée qui bénéficie des actions.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
          {doublons && (
            <div className="space-y-2 rounded-md border border-warning/50 bg-warning/10 p-3">
              <p className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="size-4 text-warning" />
                Cette cible existe peut-être déjà
              </p>
              {doublons.map(({ cible: d, raisons }) => (
                <div key={d.id_cible} className="flex items-center justify-between gap-2 rounded bg-background px-2 py-1.5 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{d.nom_complet}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {raisons.join(' · ')}
                      {d.zone_chemin ? ` · ${d.zone_chemin}` : ''}
                    </span>
                  </span>
                  {onOuvrirExistante && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onOpenChange(false)
                        onOuvrirExistante(d.id_cible)
                      }}
                    >
                      Ouvrir
                    </Button>
                  )}
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                S'il s'agit bien d'une autre {estPersonne ? 'personne' : 'cible'}, enregistrez quand même.
              </p>
            </div>
          )}

          {!cible && (
            <div className="space-y-1.5">
              <Label>Type de cible</Label>
              <Select value={type} onValueChange={(v) => setValeurs({ ...valeursInitiales(v as TypeCible), nom: valeurs.nom })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeCibleLabel).map(([code, libelle]) => (
                    <SelectItem key={code} value={code}>
                      {libelle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {estPersonne ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="c-prenom">Prénom *</Label>
                <Input id="c-prenom" value={valeurs.prenom} onChange={(e) => champ('prenom', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-nom">Nom *</Label>
                <Input id="c-nom" value={valeurs.nom} onChange={(e) => champ('nom', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Sexe</Label>
                <Select value={valeurs.sexe || 'NC'} onValueChange={(v) => champ('sexe', v === 'NC' ? '' : (v as 'M' | 'F'))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NC">Non renseigné</SelectItem>
                    <SelectItem value="F">Féminin</SelectItem>
                    <SelectItem value="M">Masculin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-naissance">Date de naissance</Label>
                <Input
                  id="c-naissance"
                  type="date"
                  value={valeurs.date_naissance ?? ''}
                  onChange={(e) => champ('date_naissance', e.target.value || null)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="c-piece">Pièce d'identité (CNI…)</Label>
                <Input
                  id="c-piece"
                  value={valeurs.numero_identification}
                  onChange={(e) => champ('numero_identification', e.target.value)}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="c-nom">Nom *</Label>
                <Input id="c-nom" value={valeurs.nom} onChange={(e) => champ('nom', e.target.value)} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="c-soustype">Précision</Label>
                  <Input
                    id="c-soustype"
                    placeholder={AIDE_SOUS_TYPE[type]}
                    value={valeurs.sous_type}
                    onChange={(e) => champ('sous_type', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-effectif">{LIBELLE_EFFECTIF[type]}</Label>
                  <Input
                    id="c-effectif"
                    type="number"
                    min={0}
                    value={valeurs.effectif ?? ''}
                    onChange={(e) => champ('effectif', e.target.value === '' ? null : Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-responsable">Responsable / personne de contact</Label>
                <Input id="c-responsable" value={valeurs.responsable} onChange={(e) => champ('responsable', e.target.value)} />
              </div>
            </>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="c-tel">Téléphone</Label>
              <Input id="c-tel" value={valeurs.telephone} onChange={(e) => champ('telephone', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" type="email" value={valeurs.email} onChange={(e) => champ('email', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Zone</Label>
            <ZoneSelect
              valeurLibelle={zoneChemin}
              onChange={(idZone, chemin) => {
                champ('zone', idZone)
                setZoneChemin(chemin)
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-adresse">Adresse / repère</Label>
            <Input id="c-adresse" value={valeurs.adresse} onChange={(e) => champ('adresse', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-notes">Notes</Label>
            <Textarea id="c-notes" rows={2} value={valeurs.notes} onChange={(e) => champ('notes', e.target.value)} />
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          {doublons ? (
            <Button variant="secondary" onClick={() => enregistrer(true)} disabled={enCours}>
              {enCours && <Loader2 className="size-4 animate-spin" />}
              Créer quand même
            </Button>
          ) : (
            <Button onClick={() => enregistrer(false)} disabled={enCours || incomplet}>
              {enCours && <Loader2 className="size-4 animate-spin" />}
              Enregistrer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
