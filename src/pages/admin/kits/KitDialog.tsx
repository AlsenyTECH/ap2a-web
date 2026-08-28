import { useEffect, useState } from 'react'
import { Loader2, Package } from 'lucide-react'
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
  Skeleton,
  Textarea,
} from '@/components/ui'
import { useCohortes, useCreerKit, useFormations, useModifierKit, useParticipantsCohorte } from '@/lib/queries'
import { cn } from '@/lib/utils'
import type { Kit, TypeCibleKit } from '@/lib/api/types'

const OPTIONS_CIBLE: Array<{ value: TypeCibleKit; label: string; description: string }> = [
  { value: 'FORMATION', label: 'Toute une formation', description: 'Tous les participants de toutes les cohortes de cette formation.' },
  { value: 'COHORTE', label: 'Une cohorte précise', description: 'Tous les participants inscrits à cette cohorte.' },
  { value: 'PARTICIPANTS', label: "Participants précis d'une cohorte", description: 'Seulement les personnes cochées ci-dessous.' },
]

interface KitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kit?: Kit | null
}

export function KitDialog({ open, onOpenChange, kit }: KitDialogProps) {
  const isEdit = Boolean(kit)
  const creer = useCreerKit()
  const modifier = useModifierKit()
  const isPending = creer.isPending || modifier.isPending

  const [nom, setNom] = useState('')
  const [contenu, setContenu] = useState('')
  const [typeCible, setTypeCible] = useState<TypeCibleKit>('FORMATION')
  const [idFormation, setIdFormation] = useState<number | null>(null)
  const [idCohorte, setIdCohorte] = useState<number | null>(null)
  const [participantsIds, setParticipantsIds] = useState<number[]>([])
  const [erreur, setErreur] = useState<string | null>(null)

  const formations = useFormations()
  const cohortes = useCohortes(idFormation)
  const participants = useParticipantsCohorte(typeCible === 'PARTICIPANTS' ? idCohorte : null)

  useEffect(() => {
    if (!open) return
    if (kit) {
      setNom(kit.nom)
      setContenu(kit.contenu)
      setTypeCible(kit.type_cible)
      setIdFormation(kit.formation?.id_formation ?? null)
      setIdCohorte(kit.cohorte?.id_cohorte ?? null)
      setParticipantsIds(kit.participants_cibles.map((p) => p.id_participant))
    } else {
      setNom('')
      setContenu('')
      setTypeCible('FORMATION')
      setIdFormation(null)
      setIdCohorte(null)
      setParticipantsIds([])
    }
    setErreur(null)
  }, [open, kit])

  function toggleParticipant(id: number) {
    setParticipantsIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  async function handleSubmit() {
    setErreur(null)
    if (!nom.trim() || !contenu.trim()) {
      setErreur('Le nom et le contenu du kit sont requis.')
      return
    }
    if (typeCible === 'FORMATION' && !idFormation) {
      setErreur('Sélectionnez la formation destinataire.')
      return
    }
    if ((typeCible === 'COHORTE' || typeCible === 'PARTICIPANTS') && !idCohorte) {
      setErreur('Sélectionnez la cohorte destinataire.')
      return
    }
    if (typeCible === 'PARTICIPANTS' && participantsIds.length === 0) {
      setErreur('Cochez au moins un participant.')
      return
    }

    const payload = {
      nom: nom.trim(),
      contenu: contenu.trim(),
      type_cible: typeCible,
      id_formation: typeCible === 'FORMATION' ? (idFormation ?? undefined) : undefined,
      id_cohorte: typeCible !== 'FORMATION' ? (idCohorte ?? undefined) : undefined,
      participants_ids: typeCible === 'PARTICIPANTS' ? participantsIds : undefined,
    }

    try {
      if (isEdit && kit) {
        await modifier.mutateAsync({ idKit: kit.id_kit, payload })
      } else {
        await creer.mutateAsync(payload)
      }
      onOpenChange(false)
    } catch {
      // erreur déjà toastée par le hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="size-4 text-primary" />
            {isEdit ? 'Modifier le kit' : 'Nouveau kit pédagogique'}
          </DialogTitle>
          <DialogDescription>
            Préparez le contenu du kit et choisissez à qui il est destiné. Toutes les formations n'ont pas besoin de kit.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="kit-nom">Nom du kit</Label>
            <Input id="kit-nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : Kit Informatique 2026" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kit-contenu">Contenu</Label>
            <Textarea
              id="kit-contenu"
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              placeholder="Ex : Manuel relié, clé USB, bloc-notes, stylo, badge d'accès..."
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Destinataire</Label>
            <div className="space-y-2">
              {OPTIONS_CIBLE.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setTypeCible(opt.value)
                    setParticipantsIds([])
                  }}
                  className={cn(
                    'w-full rounded-lg border p-3 text-left transition-colors',
                    typeCible === opt.value ? 'border-primary bg-accent' : 'border-border hover:bg-muted',
                  )}
                >
                  <p className="text-sm font-medium text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Formation</Label>
            <Select
              value={idFormation ? String(idFormation) : ''}
              onValueChange={(v) => {
                setIdFormation(Number(v))
                setIdCohorte(null)
                setParticipantsIds([])
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une formation" />
              </SelectTrigger>
              <SelectContent>
                {formations.data?.map((f) => (
                  <SelectItem key={f.id_formation} value={String(f.id_formation)}>
                    {f.titre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(typeCible === 'COHORTE' || typeCible === 'PARTICIPANTS') && (
            <div className="space-y-1.5">
              <Label>Cohorte</Label>
              <Select
                value={idCohorte ? String(idCohorte) : ''}
                onValueChange={(v) => {
                  setIdCohorte(Number(v))
                  setParticipantsIds([])
                }}
                disabled={!idFormation}
              >
                <SelectTrigger>
                  <SelectValue placeholder={idFormation ? 'Choisir une cohorte' : "Choisissez d'abord une formation"} />
                </SelectTrigger>
                <SelectContent>
                  {cohortes.data?.map((c) => (
                    <SelectItem key={c.id_cohorte} value={String(c.id_cohorte)}>
                      {c.code_cohorte}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {typeCible === 'PARTICIPANTS' && idCohorte && (
            <div className="space-y-1.5">
              <Label>Participants ({participantsIds.length} sélectionné(s))</Label>
              {participants.isLoading && <Skeleton className="h-24 w-full" />}
              {!participants.isLoading && (!participants.data || participants.data.length === 0) && (
                <p className="text-xs text-muted-foreground">Aucun participant inscrit à cette cohorte.</p>
              )}
              {!participants.isLoading && participants.data && participants.data.length > 0 && (
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                  {participants.data.map((p) => (
                    <label
                      key={p.id_participant}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                    >
                      <Checkbox
                        checked={participantsIds.includes(p.id_participant)}
                        onCheckedChange={() => toggleParticipant(p.id_participant)}
                      />
                      {p.prenom} {p.nom}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {erreur && <p className="text-xs text-destructive">{erreur}</p>}
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="button" disabled={isPending} onClick={handleSubmit}>
            {isPending && <Loader2 className="size-4 animate-spin mr-1.5" />}
            {isEdit ? 'Enregistrer' : 'Créer le kit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
