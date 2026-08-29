import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
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
} from '@/components/ui'
import { MemberMultiSelect } from '@/components/shared/MemberMultiSelect'
import { useCreerEvenement } from '@/lib/queries'
import { modeInscriptionLabel, typeEvenementLabel } from '@/lib/utils/status'
import type { ModeInscription, TypeEvenement } from '@/lib/api/types'

const schema = z
  .object({
    titre: z.string().min(1, 'Titre requis'),
    lieu: z.string().min(1, 'Lieu requis'),
    type_evenement: z.string().min(1, 'Type requis'),
    mode_inscription: z.enum(['OUVERT', 'SUR_INSCRIPTION', 'RESTREINT']),
    membres_cibles: z.array(z.number()),
    dates: z
      .array(z.object({ value: z.string().min(1, 'Date requise') }))
      .min(1, 'Au moins une date est requise'),
  })
  .refine((data) => data.mode_inscription !== 'RESTREINT' || data.membres_cibles.length > 0, {
    message: 'Sélectionnez au moins un membre',
    path: ['membres_cibles'],
  })

type FormValues = z.infer<typeof schema>

interface CreateEvenementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateEvenementDialog({ open, onOpenChange }: CreateEvenementDialogProps) {
  const creer = useCreerEvenement()

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titre: '',
      lieu: '',
      type_evenement: '',
      mode_inscription: 'OUVERT',
      membres_cibles: [],
      dates: [{ value: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'dates' })
  const typeEvenement = watch('type_evenement')
  const modeInscription = watch('mode_inscription')
  const membresCibles = watch('membres_cibles')

  useEffect(() => {
    if (open) {
      reset({
        titre: '',
        lieu: '',
        type_evenement: '',
        mode_inscription: 'OUVERT',
        membres_cibles: [],
        dates: [{ value: '' }],
      })
    }
  }, [open, reset])

  async function onSubmit(values: FormValues) {
    try {
      await creer.mutateAsync({
        titre: values.titre,
        lieu: values.lieu,
        type_evenement: values.type_evenement as TypeEvenement,
        dates: values.dates.map((d) => new Date(d.value).toISOString()),
        mode_inscription: values.mode_inscription,
        membres_cibles: values.mode_inscription === 'RESTREINT' ? values.membres_cibles : undefined,
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
          <DialogTitle>Nouvel événement</DialogTitle>
          <DialogDescription>Créer un événement et ses séances.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="titre">Titre</Label>
            <Input id="titre" {...register('titre')} />
            {errors.titre && <p className="text-xs text-destructive">{errors.titre.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lieu">Lieu</Label>
            <Input id="lieu" {...register('lieu')} />
            {errors.lieu && <p className="text-xs text-destructive">{errors.lieu.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Type d'événement</Label>
            <Select value={typeEvenement} onValueChange={(v) => setValue('type_evenement', v, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeEvenementLabel).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type_evenement && <p className="text-xs text-destructive">{errors.type_evenement.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Mode d'inscription</Label>
            <Select
              value={modeInscription}
              onValueChange={(v) => setValue('mode_inscription', v as ModeInscription, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un mode" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(modeInscriptionLabel).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {modeInscription === 'RESTREINT' && (
            <div className="space-y-1.5">
              <Label>Membres ciblés</Label>
              <MemberMultiSelect
                selectedIds={membresCibles}
                onChange={(ids) => setValue('membres_cibles', ids, { shouldValidate: true })}
              />
              {errors.membres_cibles && (
                <p className="text-xs text-destructive">{errors.membres_cibles.message}</p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Dates des séances</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '' })}>
                <Plus className="size-4" />
                Ajouter une date
              </Button>
            </div>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input type="datetime-local" {...register(`dates.${index}.value` as const)} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={fields.length <= 1}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            {errors.dates && <p className="text-xs text-destructive">{errors.dates.message as string}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={creer.isPending}>
              {creer.isPending && <Loader2 className="size-4 animate-spin" />}
              Créer l'événement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
