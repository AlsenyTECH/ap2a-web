import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Trash2, CalendarClock } from 'lucide-react'
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
import { useModifierEvenement, useSeancesEvenement } from '@/lib/queries'
import { modeInscriptionLabel, typeEvenementLabel } from '@/lib/utils/status'
import type { EvenementDetail, ModeInscription, TypeEvenement } from '@/lib/api/types'

const schema = z
  .object({
    titre: z.string().min(1, 'Titre requis'),
    lieu: z.string().min(1, 'Lieu requis'),
    type_evenement: z.string().min(1, 'Type requis'),
    description: z.string().optional(),
    mode_inscription: z.enum(['OUVERT', 'SUR_INSCRIPTION', 'RESTREINT']),
    capacite_max: z.coerce.number().min(1).optional().or(z.literal('')),
    membres_cibles: z.array(z.number()),
    modifier_dates: z.boolean(),
    dates: z.array(z.object({ value: z.string().min(1, 'Date requise') })),
  })
  .refine((data) => data.mode_inscription !== 'RESTREINT' || data.membres_cibles.length > 0, {
    message: 'Sélectionnez au moins un membre',
    path: ['membres_cibles'],
  })

type FormValues = z.infer<typeof schema>

interface EditEvenementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  evenement: EvenementDetail
}

export function EditEvenementDialog({ open, onOpenChange, evenement }: EditEvenementDialogProps) {
  const modifier = useModifierEvenement()
  const seancesQuery = useSeancesEvenement(open ? evenement.id_evenement : null)

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
      titre: evenement.titre,
      lieu: evenement.lieu,
      type_evenement: evenement.type_evenement,
      description: evenement.description ?? '',
      mode_inscription: evenement.mode_inscription ?? 'OUVERT',
      capacite_max: evenement.capacite_max ?? '',
      membres_cibles: [],
      modifier_dates: false,
      dates: [{ value: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'dates' })
  const typeEvenement = watch('type_evenement')
  const modeInscription = watch('mode_inscription')
  const membresCibles = watch('membres_cibles')
  const modifierDates = watch('modifier_dates')

  useEffect(() => {
    if (open) {
      const datesList = seancesQuery.data?.map((s) => ({
        value: s.date_seance ? new Date(s.date_seance).toISOString().slice(0, 16) : '',
      })) ?? [{ value: '' }]

      reset({
        titre: evenement.titre,
        lieu: evenement.lieu,
        type_evenement: evenement.type_evenement,
        description: evenement.description ?? '',
        mode_inscription: evenement.mode_inscription ?? 'OUVERT',
        capacite_max: evenement.capacite_max ?? '',
        membres_cibles: [],
        modifier_dates: false,
        dates: datesList.length > 0 ? datesList : [{ value: '' }],
      })
    }
  }, [open, evenement, seancesQuery.data, reset])

  async function onSubmit(values: FormValues) {
    try {
      const payload: Parameters<typeof modifier.mutateAsync>[0]['payload'] = {
        titre: values.titre,
        lieu: values.lieu,
        type_evenement: values.type_evenement as TypeEvenement,
        description: values.description || undefined,
        mode_inscription: values.mode_inscription,
        capacite_max: typeof values.capacite_max === 'number' ? values.capacite_max : undefined,
      }

      if (values.modifier_dates && values.dates.length > 0) {
        payload.dates = values.dates.map((d) => new Date(d.value).toISOString())
      }

      if (values.mode_inscription === 'RESTREINT') {
        payload.membres_cibles = values.membres_cibles
      }

      await modifier.mutateAsync({
        idEvenement: evenement.id_evenement,
        payload,
      })
      onOpenChange(false)
    } catch {
      // toast déjà géré par la mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="size-5 text-primary" />
            Modifier l'événement
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'événement, son lieu ou reportez ses dates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="titre">Titre</Label>
            <Input id="titre" {...register('titre')} />
            {errors.titre && <p className="text-xs text-destructive">{errors.titre.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lieu">Lieu</Label>
              <Input id="lieu" {...register('lieu')} />
              {errors.lieu && <p className="text-xs text-destructive">{errors.lieu.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Type d'événement</Label>
              <Select value={typeEvenement} onValueChange={(val) => setValue('type_evenement', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeEvenementLabel).map(([val, label]) => (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type_evenement && (
                <p className="text-xs text-destructive">{errors.type_evenement.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Informations complémentaires..." {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Mode d'inscription</Label>
              <Select
                value={modeInscription}
                onValueChange={(val) => setValue('mode_inscription', val as ModeInscription)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(modeInscriptionLabel).map(([val, label]) => (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="capacite_max">Capacité max (optionnel)</Label>
              <Input
                id="capacite_max"
                type="number"
                min={1}
                placeholder="Illimité"
                {...register('capacite_max')}
              />
            </div>
          </div>

          {modeInscription === 'RESTREINT' && (
            <div className="space-y-1.5">
              <Label>Membres autorisés</Label>
              <MemberMultiSelect
                selectedIds={membresCibles}
                onChange={(ids) => setValue('membres_cibles', ids, { shouldValidate: true })}
              />
              {errors.membres_cibles && (
                <p className="text-xs text-destructive">{errors.membres_cibles.message}</p>
              )}
            </div>
          )}

          {/* Section Reporter / Modifier les dates */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="modifier_dates" className="text-sm font-medium">
                  Reporter / Modifier les dates des séances
                </Label>
                <p className="text-xs text-muted-foreground">
                  Cochez pour redéfinir les dates (uniquement si aucune présence enregistrée).
                </p>
              </div>
              <input
                type="checkbox"
                id="modifier_dates"
                className="size-4 rounded border-border text-primary focus:ring-primary"
                {...register('modifier_dates')}
              />
            </div>

            {modifierDates && (
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Planning des séances</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => append({ value: '' })}
                  >
                    <Plus className="mr-1 size-3" />
                    Ajouter une date
                  </Button>
                </div>

                {fields.map((field, idx) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <span className="w-16 text-xs text-muted-foreground font-medium">Séance {idx + 1}</span>
                    <Input
                      type="datetime-local"
                      className="flex-1"
                      {...register(`dates.${idx}.value`)}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive"
                        onClick={() => remove(idx)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={modifier.isPending}>
              {modifier.isPending && <Loader2 className="size-4 animate-spin" />}
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
