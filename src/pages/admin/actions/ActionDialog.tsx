import { useEffect, useState } from 'react'
import { ClipboardList, Loader2 } from 'lucide-react'
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
  Switch,
  Textarea,
} from '@/components/ui'
import { useCreerAction, useMutationFiche, useTypesAction } from '@/lib/queries'
import { actionsApi, type ActionPayload } from '@/lib/api/actions'
import type { ActionFiche, Besoin } from '@/lib/api/types'
import { ZoneSelect } from '../referentiels/ZoneSelect'
import { MembreSelect } from './MembreSelect'

interface ActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Modification si fournie. */
  action?: ActionFiche | null
  /** Création à partir de besoins choisis (leurs cibles sont ajoutées). */
  besoins?: Besoin[]
  onCreee?: (idAction: number) => void
}

const aujourdhui = () => new Date().toISOString().slice(0, 10)

export function ActionDialog({ open, onOpenChange, action, besoins = [], onCreee }: ActionDialogProps) {
  const types = useTypesAction()
  const creer = useCreerAction()
  const modifier = useMutationFiche(action?.id_action ?? 0, (p: Partial<ActionPayload>) =>
    actionsApi.modifier(action!.id_action, p), 'Action mise à jour')
  const [v, setV] = useState<ActionPayload>({ titre: '', type_action: 0, date_debut: aujourdhui() })
  const [zoneChemin, setZoneChemin] = useState<string | null>(null)
  const [responsable, setResponsable] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (action) {
      setV({
        titre: action.titre,
        type_action: action.type_action,
        description: action.description,
        date_debut: action.date_debut,
        date_fin: action.date_fin,
        lieu: action.lieu,
        zone: action.zone,
        responsable: action.id_responsable,
        budget_prevu: action.budget_prevu ? Number(action.budget_prevu) : null,
        appel_volontaires: action.appel_volontaires,
        volontaires_souhaites: action.volontaires_souhaites,
      })
      setZoneChemin(action.zone_chemin)
      setResponsable(action.responsable)
    } else {
      // Pré-remplissage depuis les besoins : type proposé et titre parlant.
      const typeSuggere = besoins.find((b) => b.type_action)?.type_action ?? 0
      setV({
        titre: besoins.length === 1 ? besoins[0].description : '',
        type_action: typeSuggere,
        date_debut: aujourdhui(),
        appel_volontaires: false,
      })
      setZoneChemin(null)
      setResponsable(null)
    }
  }, [open, action, besoins])

  function champ<K extends keyof ActionPayload>(cle: K, valeur: ActionPayload[K]) {
    setV((ancien) => ({ ...ancien, [cle]: valeur }))
  }

  async function enregistrer() {
    try {
      if (action) {
        await modifier.mutateAsync(v)
      } else {
        const fiche = await creer.mutateAsync({ ...v, besoins: besoins.map((b) => b.id_besoin) })
        onCreee?.(fiche.id_action)
      }
      onOpenChange(false)
    } catch {
      // toast déjà affiché
    }
  }

  const enCours = creer.isPending || modifier.isPending
  const typesActifs = (types.data ?? []).filter((t) => t.actif)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="size-4 text-primary" />
            {action ? "Modifier l'action" : 'Nouvelle action'}
          </DialogTitle>
          <DialogDescription>
            {besoins.length > 0
              ? `Pour ${besoins.length} besoin(s) : ${besoins.map((b) => b.cible).join(', ')}`
              : 'Les cibles, l’équipe, les partenaires et les tâches se complètent ensuite sur la fiche.'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="a-titre">Titre *</Label>
            <Input id="a-titre" value={v.titre} placeholder="Ex : Visite médicale Unité 17" onChange={(e) => champ('titre', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Type d'action *</Label>
            <Select value={v.type_action ? String(v.type_action) : ''} onValueChange={(t) => champ('type_action', Number(t))}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir…" />
              </SelectTrigger>
              <SelectContent>
                {typesActifs.map((t) => (
                  <SelectItem key={t.id_type_action} value={String(t.id_type_action)}>
                    {t.libelle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="a-debut">Début *</Label>
              <Input id="a-debut" type="date" value={v.date_debut} onChange={(e) => champ('date_debut', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-fin">Fin</Label>
              <Input id="a-fin" type="date" value={v.date_fin ?? ''} onChange={(e) => champ('date_fin', e.target.value || null)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Zone</Label>
            <ZoneSelect
              valeurLibelle={zoneChemin}
              onChange={(id, chemin) => {
                champ('zone', id)
                setZoneChemin(chemin)
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="a-lieu">Lieu précis</Label>
            <Input id="a-lieu" value={v.lieu ?? ''} placeholder="Ex : École élémentaire U17" onChange={(e) => champ('lieu', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Responsable</Label>
            <MembreSelect
              libelle={responsable}
              onChange={(id, nom) => {
                champ('responsable', id)
                setResponsable(nom)
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="a-budget">Budget prévu (FCFA)</Label>
            <Input
              id="a-budget"
              type="number"
              inputMode="numeric"
              min={0}
              value={v.budget_prevu ?? ''}
              onChange={(e) => champ('budget_prevu', e.target.value === '' ? null : Number(e.target.value))}
            />
          </div>
          <div className="space-y-2 rounded-md border p-3">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={Boolean(v.appel_volontaires)} onCheckedChange={(b) => champ('appel_volontaires', b)} />
              Appel à volontaires parmi les membres
            </label>
            {v.appel_volontaires && (
              <Input
                type="number"
                min={1}
                placeholder="Nombre de volontaires souhaités"
                value={v.volontaires_souhaites ?? ''}
                onChange={(e) => champ('volontaires_souhaites', e.target.value === '' ? null : Number(e.target.value))}
              />
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="a-desc">Description</Label>
            <Textarea id="a-desc" rows={3} value={v.description ?? ''} onChange={(e) => champ('description', e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={enregistrer} disabled={enCours || !v.titre.trim() || !v.type_action || !v.date_debut}>
            {enCours && <Loader2 className="size-4 animate-spin" />}
            {action ? 'Enregistrer' : "Créer l'action"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
