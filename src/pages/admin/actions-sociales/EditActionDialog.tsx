import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Pencil } from 'lucide-react'
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
import { useModifierActionSociale } from '@/lib/queries'
import { typeActionSocialeLabel } from '@/lib/utils/status'
import type { ActionSocialeDetail, StatutActionSociale, TypeActionSociale } from '@/lib/api/types'

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

interface EditActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: ActionSocialeDetail
}

export function EditActionDialog({ open, onOpenChange, action }: EditActionDialogProps) {
  const modifier = useModifierActionSociale()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titre: action.titre,
      type_action: action.type_action,
      description: action.description ?? '',
      lieu: action.lieu ?? '',
      date_debut: action.date_debut ? action.date_debut.slice(0, 10) : '',
      date_fin: action.date_fin ? action.date_fin.slice(0, 10) : '',
      statut: (action.statut as any) ?? 'PLANIFIE',
      contenu_don: action.contenu_don ?? '',
    },
  })

  const typeAction = watch('type_action')
  const statut = watch('statut')

  useEffect(() => {
    if (open) {
      reset({
        titre: action.titre,
        type_action: action.type_action,
        description: action.description ?? '',
        lieu: action.lieu ?? '',
        date_debut: action.date_debut ? action.date_debut.slice(0, 10) : '',
        date_fin: action.date_fin ? action.date_fin.slice(0, 10) : '',
        statut: (action.statut as any) ?? 'PLANIFIE',
        contenu_don: action.contenu_don ?? '',
      })
    }
  }, [open, action, reset])

  async function onSubmit(values: FormValues) {
    try {
      await modifier.mutateAsync({
        idAction: action.id_action,
        payload: {
          titre: values.titre,
          type_action: values.type_action as TypeActionSociale,
          description: values.description || undefined,
          lieu: values.lieu || undefined,
          date_debut: values.date_debut,
          date_fin: values.date_fin || undefined,
          statut: values.statut as StatutActionSociale,
          contenu_don: values.type_action === 'DON' ? values.contenu_don || undefined : undefined,
        },
      })
      onOpenChange(false)
    } catch {
      // géré par hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-5 text-primary" />
            Modifier l'action sociale
          </DialogTitle>
          <DialogDescription>
            Modifiez le titre, le lieu, les dates ou le statut de l'action sociale.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="titre">Titre</Label>
            <Input id="titre" {...register('titre')} />
            {errors.titre && <p className="text-xs text-destructive">{errors.titre.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
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

            <div className="space-y-1.5">
              <Label>Statut</Label>
              <Select value={statut} onValueChange={(v) => setValue('statut', v as any)}>
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

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={modifier.isPending}>
              {modifier.isPending && <Loader2 className="size-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
