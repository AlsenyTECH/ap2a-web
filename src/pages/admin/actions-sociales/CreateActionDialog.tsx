import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
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
import { useCreerActionSociale } from '@/lib/queries'
import { typeActionSocialeLabel } from '@/lib/utils/status'
import type { StatutActionSociale, TypeActionSociale } from '@/lib/api/types'

const schema = z.object({
  titre: z.string().min(1, 'Titre requis'),
  type_action: z.string().min(1, "Type d'action requis"),
  description: z.string().optional(),
  lieu: z.string().optional(),
  date_debut: z.string().min(1, 'Date de début requise'),
  date_fin: z.string().optional(),
  statut: z.enum(['PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE']),
  contenu_don: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const EMPTY_VALUES: FormValues = {
  titre: '',
  type_action: '',
  description: '',
  lieu: '',
  date_debut: '',
  date_fin: '',
  statut: 'PLANIFIE',
  contenu_don: '',
}

interface CreateActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateActionDialog({ open, onOpenChange }: CreateActionDialogProps) {
  const creer = useCreerActionSociale()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY_VALUES })

  const typeAction = watch('type_action')
  const statut = watch('statut')

  useEffect(() => {
    if (open) reset(EMPTY_VALUES)
  }, [open, reset])

  async function onSubmit(values: FormValues) {
    try {
      await creer.mutateAsync({
        titre: values.titre,
        type_action: values.type_action as TypeActionSociale,
        description: values.description || undefined,
        lieu: values.lieu || undefined,
        date_debut: values.date_debut,
        date_fin: values.date_fin || undefined,
        statut: values.statut as StatutActionSociale,
        contenu_don: values.type_action === 'DON' ? values.contenu_don || undefined : undefined,
      })
      onOpenChange(false)
    } catch {
      // erreur déjà toastée par le hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle action sociale</DialogTitle>
          <DialogDescription>Créer une nouvelle action sociale.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="titre">Titre</Label>
            <Input id="titre" {...register('titre')} />
            {errors.titre && <p className="text-xs text-destructive">{errors.titre.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Type d'action</Label>
            <Select value={typeAction} onValueChange={(v) => setValue('type_action', v, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeActionSocialeLabel).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type_action && <p className="text-xs text-destructive">{errors.type_action.message}</p>}
          </div>
          {typeAction === 'DON' && (
            <div className="space-y-1.5 rounded-md border border-primary/40 bg-primary/5 p-3">
              <Label htmlFor="contenu_don">Contenu du don</Label>
              <Textarea
                id="contenu_don"
                placeholder="ex. Kits alimentaires, vivres, matériel scolaire…"
                {...register('contenu_don')}
              />
              <p className="text-xs text-muted-foreground">
                Précisez ce qui sera concrètement distribué aux bénéficiaires.
              </p>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lieu">Lieu</Label>
            <Input id="lieu" {...register('lieu')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date_debut">Date de début</Label>
              <Input id="date_debut" type="date" {...register('date_debut')} />
              {errors.date_debut && <p className="text-xs text-destructive">{errors.date_debut.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date_fin">Date de fin (optionnel)</Label>
              <Input id="date_fin" type="date" {...register('date_fin')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Statut</Label>
            <Select value={statut} onValueChange={(v) => setValue('statut', v as StatutActionSociale)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLANIFIE">Planifiée</SelectItem>
                <SelectItem value="EN_COURS">En cours</SelectItem>
                <SelectItem value="TERMINE">Terminée</SelectItem>
                <SelectItem value="ANNULE">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={creer.isPending}>
              {creer.isPending && <Loader2 className="size-4 animate-spin" />}
              Créer l'action
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
