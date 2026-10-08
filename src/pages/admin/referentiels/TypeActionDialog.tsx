import { useEffect, useState } from 'react'
import { ListChecks, Loader2 } from 'lucide-react'
import {
  Button,
  Checkbox,
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
import { useCreerTypeAction, useModifierTypeAction } from '@/lib/queries'
import { categorieActionLabel, typeCibleLabel } from '@/lib/utils/status'
import type { TypeActionPayload } from '@/lib/api/referentiels'
import type { CategorieAction, TypeAction, TypeCible } from '@/lib/api/types'

const VIDE: TypeActionPayload = {
  libelle: '',
  description: '',
  categorie: 'SOCIAL',
  types_cible: [],
  est_formation: false,
  actif: true,
}

interface TypeActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  typeAction: TypeAction | null
  onCree?: (typeAction: TypeAction) => void
}

export function TypeActionDialog({ open, onOpenChange, typeAction, onCree }: TypeActionDialogProps) {
  const creer = useCreerTypeAction()
  const modifier = useModifierTypeAction()
  const [valeurs, setValeurs] = useState<TypeActionPayload>(VIDE)

  useEffect(() => {
    if (!open) return
    setValeurs(
      typeAction
        ? {
            libelle: typeAction.libelle,
            description: typeAction.description,
            categorie: typeAction.categorie,
            types_cible: typeAction.types_cible,
            est_formation: typeAction.est_formation,
            actif: typeAction.actif,
          }
        : VIDE,
    )
  }, [open, typeAction])

  function basculerCible(code: TypeCible) {
    setValeurs((v) => ({
      ...v,
      types_cible: v.types_cible.includes(code) ? v.types_cible.filter((c) => c !== code) : [...v.types_cible, code],
    }))
  }

  async function enregistrer() {
    try {
      if (typeAction) {
        await modifier.mutateAsync({ idTypeAction: typeAction.id_type_action, payload: valeurs })
      } else {
        onCree?.(await creer.mutateAsync(valeurs))
      }
      onOpenChange(false)
    } catch {
      // toast déjà affiché
    }
  }

  const enCours = creer.isPending || modifier.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListChecks className="size-4 text-primary" />
            {typeAction ? "Modifier le type d'action" : "Nouveau type d'action"}
          </DialogTitle>
          <DialogDescription>
            Ex : « Reboisement », « Appui aux talibés »… Ses indicateurs se définissent ensuite.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="ta-libelle">Libellé *</Label>
            <Input id="ta-libelle" value={valeurs.libelle} onChange={(e) => setValeurs({ ...valeurs, libelle: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Catégorie</Label>
            <Select value={valeurs.categorie} onValueChange={(v) => setValeurs({ ...valeurs, categorie: v as CategorieAction })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categorieActionLabel).map(([code, libelle]) => (
                  <SelectItem key={code} value={code}>
                    {libelle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Cibles concernées *</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(typeCibleLabel) as TypeCible[]).map((code) => (
                <label key={code} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={valeurs.types_cible.includes(code)} onCheckedChange={() => basculerCible(code)} />
                  {typeCibleLabel[code]}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ta-description">Description</Label>
            <Textarea
              id="ta-description"
              rows={3}
              value={valeurs.description}
              onChange={(e) => setValeurs({ ...valeurs, description: e.target.value })}
            />
          </div>
          <label className="flex items-start gap-2 text-sm">
            <Switch
              checked={valeurs.est_formation}
              onCheckedChange={(est_formation) => setValeurs({ ...valeurs, est_formation })}
            />
            <span>
              Action de formation
              <span className="block text-xs text-muted-foreground">
                Utilise aussi les cohortes, séances, présences et certificats.
              </span>
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={enregistrer} disabled={enCours || !valeurs.libelle.trim() || valeurs.types_cible.length === 0}>
            {enCours && <Loader2 className="size-4 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
