import { useEffect, useState } from 'react'
import { Handshake, Loader2 } from 'lucide-react'
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
import { useCreerPartenaire, useModifierPartenaire } from '@/lib/queries'
import { typePartenaireLabel } from '@/lib/utils/status'
import type { PartenairePayload } from '@/lib/api/referentiels'
import type { Partenaire, TypePartenaire } from '@/lib/api/types'
import { ZoneSelect } from './ZoneSelect'

const VIDE: PartenairePayload = {
  nom: '',
  sigle: '',
  type_partenaire: 'ONG',
  domaines: '',
  nom_contact: '',
  telephone: '',
  email: '',
  adresse: '',
  zone: null,
  notes: '',
  actif: true,
}

interface PartenaireDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  partenaire: Partenaire | null
}

export function PartenaireDialog({ open, onOpenChange, partenaire }: PartenaireDialogProps) {
  const creer = useCreerPartenaire()
  const modifier = useModifierPartenaire()
  const [valeurs, setValeurs] = useState<PartenairePayload>(VIDE)
  const [zoneChemin, setZoneChemin] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (partenaire) {
      const { id_partenaire: _id, zone_chemin, date_creation: _date, ...reste } = partenaire
      setValeurs(reste)
      setZoneChemin(zone_chemin)
    } else {
      setValeurs(VIDE)
      setZoneChemin(null)
    }
  }, [open, partenaire])

  function champ<K extends keyof PartenairePayload>(cle: K, valeur: PartenairePayload[K]) {
    setValeurs((v) => ({ ...v, [cle]: valeur }))
  }

  async function enregistrer() {
    try {
      if (partenaire) {
        await modifier.mutateAsync({ idPartenaire: partenaire.id_partenaire, payload: valeurs })
      } else {
        await creer.mutateAsync(valeurs)
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
            <Handshake className="size-4 text-primary" />
            {partenaire ? 'Modifier le partenaire' : 'Nouveau partenaire'}
          </DialogTitle>
          <DialogDescription>Organisation avec laquelle l'association mène ses actions.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
          <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
            <div className="space-y-1.5">
              <Label htmlFor="p-nom">Nom *</Label>
              <Input id="p-nom" value={valeurs.nom} onChange={(e) => champ('nom', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-sigle">Sigle</Label>
              <Input id="p-sigle" value={valeurs.sigle} onChange={(e) => champ('sigle', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Type *</Label>
            <Select value={valeurs.type_partenaire} onValueChange={(v) => champ('type_partenaire', v as TypePartenaire)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typePartenaireLabel).map(([code, libelle]) => (
                  <SelectItem key={code} value={code}>
                    {libelle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-domaines">Domaines d'intervention</Label>
            <Input
              id="p-domaines"
              placeholder="Ex : santé maternelle, couture, informatique"
              value={valeurs.domaines}
              onChange={(e) => champ('domaines', e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="p-contact">Personne de contact</Label>
              <Input id="p-contact" value={valeurs.nom_contact} onChange={(e) => champ('nom_contact', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-tel">Téléphone</Label>
              <Input id="p-tel" value={valeurs.telephone} onChange={(e) => champ('telephone', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-email">Email</Label>
            <Input id="p-email" type="email" value={valeurs.email} onChange={(e) => champ('email', e.target.value)} />
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
            <Label htmlFor="p-adresse">Adresse</Label>
            <Input id="p-adresse" value={valeurs.adresse} onChange={(e) => champ('adresse', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-notes">Notes</Label>
            <Textarea id="p-notes" rows={3} value={valeurs.notes} onChange={(e) => champ('notes', e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={enregistrer} disabled={enCours || !valeurs.nom.trim()}>
            {enCours && <Loader2 className="size-4 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
