import { useEffect, useState } from 'react'
import { Loader2, Plus, Ruler, X } from 'lucide-react'
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
import { useCreerIndicateur, useModifierIndicateur } from '@/lib/queries'
import { momentIndicateurLabel, niveauIndicateurLabel, typeValeurLabel } from '@/lib/utils/status'
import type { IndicateurPayload } from '@/lib/api/referentiels'
import type {
  DefinitionIndicateur,
  MomentIndicateur,
  NiveauIndicateur,
  TypeAction,
  TypeValeurIndicateur,
} from '@/lib/api/types'

const VIDE: IndicateurPayload = {
  libelle: '',
  description: '',
  type_valeur: 'ENTIER',
  unite: '',
  choix: [],
  moment: 'INTERVENTION',
  niveau: 'CIBLE',
  obligatoire: false,
  sensible: false,
  actif: true,
}

const AIDE_MOMENT: Record<MomentIndicateur, string> = {
  REFERENCE: "Situation avant l'action, pour mesurer le changement (ex : état de l'école avant travaux).",
  INTERVENTION: "Ce qui est fait ou remis pendant l'action (ex : kits distribués).",
  SUIVI: 'Ce qui est observé lors des visites de suivi (ex : activité toujours en fonctionnement).',
}

interface IndicateurDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  typeAction: TypeAction
  indicateur: DefinitionIndicateur | null
}

export function IndicateurDialog({ open, onOpenChange, typeAction, indicateur }: IndicateurDialogProps) {
  const creer = useCreerIndicateur()
  const modifier = useModifierIndicateur()
  const [valeurs, setValeurs] = useState<IndicateurPayload>(VIDE)
  const [nouveauChoix, setNouveauChoix] = useState('')

  useEffect(() => {
    if (!open) return
    if (indicateur) {
      const { id_indicateur: _id, type_action: _type, code: _code, ordre: _ordre, ...reste } = indicateur
      setValeurs(reste)
    } else {
      setValeurs(VIDE)
    }
    setNouveauChoix('')
  }, [open, indicateur])

  function ajouterChoix() {
    const choix = nouveauChoix.trim()
    if (!choix || valeurs.choix.some((c) => c.toLowerCase() === choix.toLowerCase())) return
    setValeurs((v) => ({ ...v, choix: [...v.choix, choix] }))
    setNouveauChoix('')
  }

  async function enregistrer() {
    const payload = { ...valeurs, choix: valeurs.type_valeur === 'CHOIX' ? valeurs.choix : [] }
    try {
      if (indicateur) {
        await modifier.mutateAsync({ idIndicateur: indicateur.id_indicateur, payload })
      } else {
        await creer.mutateAsync({ idTypeAction: typeAction.id_type_action, payload })
      }
      onOpenChange(false)
    } catch {
      // toast déjà affiché
    }
  }

  const enCours = creer.isPending || modifier.isPending
  const choixIncomplets = valeurs.type_valeur === 'CHOIX' && valeurs.choix.length < 2

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="size-4 text-primary" />
            {indicateur ? "Modifier l'indicateur" : 'Nouvel indicateur'}
          </DialogTitle>
          <DialogDescription>{typeAction.libelle}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="ind-libelle">Libellé *</Label>
            <Input
              id="ind-libelle"
              placeholder="Ex : Kits distribués"
              value={valeurs.libelle}
              onChange={(e) => setValeurs({ ...valeurs, libelle: e.target.value })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
            <div className="space-y-1.5">
              <Label>Type de valeur</Label>
              <Select
                value={valeurs.type_valeur}
                onValueChange={(v) => setValeurs({ ...valeurs, type_valeur: v as TypeValeurIndicateur })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeValeurLabel).map(([code, libelle]) => (
                    <SelectItem key={code} value={code}>
                      {libelle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ind-unite">Unité</Label>
              <Input
                id="ind-unite"
                placeholder="kits, kg, FCFA…"
                value={valeurs.unite}
                onChange={(e) => setValeurs({ ...valeurs, unite: e.target.value })}
              />
            </div>
          </div>

          {valeurs.type_valeur === 'CHOIX' && (
            <div className="space-y-1.5 rounded-md border p-3">
              <Label>Choix possibles (au moins deux)</Label>
              <div className="flex flex-wrap gap-1.5">
                {valeurs.choix.map((c) => (
                  <span key={c} className="flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs">
                    {c}
                    <button
                      type="button"
                      aria-label={`Retirer ${c}`}
                      onClick={() => setValeurs((v) => ({ ...v, choix: v.choix.filter((x) => x !== c) }))}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={nouveauChoix}
                  placeholder="Ajouter un choix"
                  onChange={(e) => setNouveauChoix(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      ajouterChoix()
                    }
                  }}
                />
                <Button type="button" variant="outline" size="icon" aria-label="Ajouter le choix" onClick={ajouterChoix}>
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Moment de saisie</Label>
              <Select value={valeurs.moment} onValueChange={(v) => setValeurs({ ...valeurs, moment: v as MomentIndicateur })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(momentIndicateurLabel).map(([code, libelle]) => (
                    <SelectItem key={code} value={code}>
                      {libelle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Niveau</Label>
              <Select value={valeurs.niveau} onValueChange={(v) => setValeurs({ ...valeurs, niveau: v as NiveauIndicateur })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(niveauIndicateurLabel).map(([code, libelle]) => (
                    <SelectItem key={code} value={code}>
                      {libelle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{AIDE_MOMENT[valeurs.moment]}</p>

          <div className="space-y-1.5">
            <Label htmlFor="ind-description">Aide à la saisie</Label>
            <Textarea
              id="ind-description"
              rows={2}
              value={valeurs.description}
              onChange={(e) => setValeurs({ ...valeurs, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={valeurs.obligatoire} onCheckedChange={(obligatoire) => setValeurs({ ...valeurs, obligatoire })} />
              Saisie obligatoire
            </label>
            <label className="flex items-start gap-2 text-sm">
              <Switch checked={valeurs.sensible} onCheckedChange={(sensible) => setValeurs({ ...valeurs, sensible })} />
              <span>
                Donnée médicale / sensible
                <span className="block text-xs text-muted-foreground">
                  Visible uniquement avec la permission « Données médicales ».
                </span>
              </span>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={enregistrer} disabled={enCours || !valeurs.libelle.trim() || choixIncomplets}>
            {enCours && <Loader2 className="size-4 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
