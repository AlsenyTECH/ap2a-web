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
} from '@/components/ui'
import { useAjouterSeanceCohorte, useModifierSeanceCohorte } from '@/lib/queries'
import type { SeanceCohorte } from '@/lib/api/types'

const schema = z.object({
  date_seance: z.string().min(1, 'Date de début requise'),
  heure_fin: z.string().optional(),
  titre_seance: z.string().optional(),
  type_seance: z.enum(['COURS', 'TD', 'TP', 'EXAMEN']),
  lieu: z.string().optional(),
  formateur_seance: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface SeanceCohorteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  idCohorte: number
  seanceToEdit?: SeanceCohorte | null
}

export function SeanceCohorteDialog({
  open,
  onOpenChange,
  idCohorte,
  seanceToEdit,
}: SeanceCohorteDialogProps) {
  const ajouter = useAjouterSeanceCohorte()
  const modifier = useModifierSeanceCohorte()

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
      date_seance: '',
      heure_fin: '',
      titre_seance: '',
      type_seance: 'COURS',
      lieu: '',
      formateur_seance: '',
    },
  })

  const typeSeance = watch('type_seance')

  useEffect(() => {
    if (open) {
      if (seanceToEdit) {
        reset({
          date_seance: seanceToEdit.date_seance ? new Date(seanceToEdit.date_seance).toISOString().slice(0, 16) : '',
          heure_fin: seanceToEdit.heure_fin ? new Date(seanceToEdit.heure_fin).toISOString().slice(0, 16) : '',
          titre_seance: seanceToEdit.titre_seance ?? '',
          type_seance: (seanceToEdit.type_seance as any) ?? 'COURS',
          lieu: seanceToEdit.lieu ?? '',
          formateur_seance: seanceToEdit.formateur_seance ?? '',
        })
      } else {
        reset({
          date_seance: '',
          heure_fin: '',
          titre_seance: '',
          type_seance: 'COURS',
          lieu: '',
          formateur_seance: '',
        })
      }
    }
  }, [open, seanceToEdit, reset])

  async function onSubmit(values: FormValues) {
    try {
      if (seanceToEdit) {
        await modifier.mutateAsync({
          idSeanceCohorte: seanceToEdit.id_seance_cohorte,
          idCohorte,
          payload: {
            date_seance: new Date(values.date_seance).toISOString(),
            heure_fin: values.heure_fin ? new Date(values.heure_fin).toISOString() : undefined,
            titre_seance: values.titre_seance || undefined,
            type_seance: values.type_seance,
            lieu: values.lieu || undefined,
            formateur_seance: values.formateur_seance || undefined,
          },
        })
      } else {
        await ajouter.mutateAsync({
          idCohorte,
          payload: {
            date_seance: new Date(values.date_seance).toISOString(),
            heure_fin: values.heure_fin ? new Date(values.heure_fin).toISOString() : undefined,
            titre_seance: values.titre_seance || undefined,
            type_seance: values.type_seance,
            lieu: values.lieu || undefined,
            formateur_seance: values.formateur_seance || undefined,
          },
        })
      }
      onOpenChange(false)
    } catch {
      // géré par react-query
    }
  }

  const isPending = ajouter.isPending || modifier.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{seanceToEdit ? 'Modifier la séance' : 'Ajouter une séance'}</DialogTitle>
          <DialogDescription>
            Configurez la date, le lieu, l'intervenant et le sujet de la séance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="titre_seance">Titre / Sujet de la séance</Label>
            <Input id="titre_seance" placeholder="Ex: Introduction au module 1" {...register('titre_seance')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date_seance">Début</Label>
              <Input id="date_seance" type="datetime-local" {...register('date_seance')} />
              {errors.date_seance && (
                <p className="text-xs text-destructive">{errors.date_seance.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="heure_fin">Fin (optionnel)</Label>
              <Input id="heure_fin" type="datetime-local" {...register('heure_fin')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type de séance</Label>
              <Select value={typeSeance} onValueChange={(v) => setValue('type_seance', v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COURS">Cours</SelectItem>
                  <SelectItem value="TD">Travaux dirigés (TD)</SelectItem>
                  <SelectItem value="TP">Travaux pratiques (TP)</SelectItem>
                  <SelectItem value="EXAMEN">Examen / Évaluation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lieu">Lieu / Salle</Label>
              <Input id="lieu" placeholder="Ex: Salle A1" {...register('lieu')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="formateur_seance">Intervenant / Formateur</Label>
            <Input id="formateur_seance" placeholder="Laisser vide pour formateur principal" {...register('formateur_seance')} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {seanceToEdit ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
