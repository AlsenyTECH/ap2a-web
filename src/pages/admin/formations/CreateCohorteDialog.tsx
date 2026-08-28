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
  Switch,
  Textarea,
} from '@/components/ui'
import { MemberMultiSelect } from '@/components/shared/MemberMultiSelect'
import { useCreerCohorte } from '@/lib/queries'
import type { PublicCibleType } from '@/lib/api/types'

const seanceSchema = z.object({
  date_seance: z.string().min(1, 'Date requise'),
  heure_fin: z.string().optional(),
  lieu: z.string().optional(),
  titre_seance: z.string().optional(),
  type_seance: z.string().optional(),
  formateur_seance: z.string().optional(),
})

const schema = z
  .object({
    code_cohorte: z.string().min(1, 'Code requis'),
    lieu: z.string().min(1, 'Lieu requis'),
    formateur: z.string().optional(),
    capacite_max: z.string().optional(),
    capacite_min: z.string().optional(),
    materiel_necessaire: z.string().optional(),
    est_payante: z.boolean(),
    prix: z.string().optional(),
    prix_adherent: z.string().optional(),
    date_limite_inscription: z.string().optional(),
    conditions_annulation: z.string().optional(),
    financeur: z.string().optional(),
    numero_convention: z.string().optional(),
    public_cible_type: z.enum(['TOUS', 'SPECIFIQUE']),
    membres_cibles: z.array(z.number()).optional(),
    seances: z.array(seanceSchema).min(1, 'Au moins une séance est requise'),
  })
  .refine((data) => data.public_cible_type !== 'SPECIFIQUE' || (data.membres_cibles?.length ?? 0) > 0, {
    message: 'Sélectionnez au moins un membre',
    path: ['membres_cibles'],
  })

type FormValues = z.infer<typeof schema>

const EMPTY_VALUES: FormValues = {
  code_cohorte: '',
  lieu: '',
  formateur: '',
  capacite_max: '',
  capacite_min: '',
  materiel_necessaire: '',
  est_payante: true,
  prix: '',
  prix_adherent: '',
  date_limite_inscription: '',
  conditions_annulation: '',
  financeur: '',
  numero_convention: '',
  public_cible_type: 'TOUS',
  membres_cibles: [],
  seances: [{ date_seance: '', heure_fin: '', lieu: '', titre_seance: '', type_seance: '', formateur_seance: '' }],
}

interface CreateCohorteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  idFormation: number
}

export function CreateCohorteDialog({ open, onOpenChange, idFormation }: CreateCohorteDialogProps) {
  const creer = useCreerCohorte()

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY_VALUES })

  const { fields, append, remove } = useFieldArray({ control, name: 'seances' })

  const estPayante = watch('est_payante')
  const publicCibleType = watch('public_cible_type')
  const membresCibles = watch('membres_cibles') ?? []

  useEffect(() => {
    if (open) reset(EMPTY_VALUES)
  }, [open, reset])

  async function onSubmit(values: FormValues) {
    try {
      await creer.mutateAsync({
        id_formation: idFormation,
        code_cohorte: values.code_cohorte,
        lieu: values.lieu,
        formateur: values.formateur || undefined,
        capacite_max: values.capacite_max ? Number(values.capacite_max) : undefined,
        capacite_min: values.capacite_min ? Number(values.capacite_min) : undefined,
        materiel_necessaire: values.materiel_necessaire || undefined,
        est_payante: values.est_payante,
        prix: values.est_payante ? values.prix || undefined : undefined,
        prix_adherent: values.est_payante ? values.prix_adherent || undefined : undefined,
        date_limite_inscription: values.date_limite_inscription || undefined,
        conditions_annulation: values.conditions_annulation || undefined,
        financeur: values.financeur || undefined,
        numero_convention: values.numero_convention || undefined,
        public_cible_type: values.public_cible_type,
        membres_cibles: values.public_cible_type === 'SPECIFIQUE' ? values.membres_cibles : undefined,
        seances: values.seances.map((s) => ({
          date_seance: new Date(s.date_seance).toISOString(),
          heure_fin: s.heure_fin || undefined,
          lieu: s.lieu || undefined,
          titre_seance: s.titre_seance || undefined,
          type_seance: s.type_seance || undefined,
          formateur_seance: s.formateur_seance || undefined,
        })),
      })
      onOpenChange(false)
    } catch {
      // erreur déjà toastée par le hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvelle cohorte</DialogTitle>
          <DialogDescription>Créer une cohorte et planifier ses séances.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="max-h-[75vh] space-y-5 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="code_cohorte">Code cohorte</Label>
              <Input id="code_cohorte" {...register('code_cohorte')} />
              {errors.code_cohorte && <p className="text-xs text-destructive">{errors.code_cohorte.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lieu">Lieu</Label>
              <Input id="lieu" {...register('lieu')} />
              {errors.lieu && <p className="text-xs text-destructive">{errors.lieu.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="formateur">Formateur</Label>
              <Input id="formateur" {...register('formateur')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date_limite_inscription">Date limite d'inscription</Label>
              <Input id="date_limite_inscription" type="date" {...register('date_limite_inscription')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="capacite_min">Capacité minimum</Label>
              <Input id="capacite_min" type="number" min="0" {...register('capacite_min')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="capacite_max">Capacité maximum</Label>
              <Input id="capacite_max" type="number" min="0" {...register('capacite_max')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="financeur">Financeur</Label>
              <Input id="financeur" {...register('financeur')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="numero_convention">N° de convention</Label>
              <Input id="numero_convention" {...register('numero_convention')} />
            </div>
          </div>

          <div className="space-y-3 rounded-md border border-border p-3">
            <div className="flex items-center gap-2">
              <Switch
                id="est_payante"
                checked={estPayante}
                onCheckedChange={(v) => setValue('est_payante', v)}
              />
              <Label htmlFor="est_payante">Formation payante</Label>
            </div>
            {estPayante && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="prix">Prix</Label>
                  <Input id="prix" {...register('prix')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prix_adherent">Prix adhérent</Label>
                  <Input id="prix_adherent" {...register('prix_adherent')} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Public cible</Label>
            <Select
              value={publicCibleType}
              onValueChange={(v) => setValue('public_cible_type', v as PublicCibleType, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TOUS">Tous les membres</SelectItem>
                <SelectItem value="SPECIFIQUE">Sélection de membres</SelectItem>
              </SelectContent>
            </Select>
            {publicCibleType === 'SPECIFIQUE' && (
              <div className="space-y-1.5">
                <MemberMultiSelect
                  selectedIds={membresCibles}
                  onChange={(ids) => setValue('membres_cibles', ids, { shouldValidate: true })}
                />
                {errors.membres_cibles && (
                  <p className="text-xs text-destructive">{errors.membres_cibles.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="materiel_necessaire">Matériel nécessaire</Label>
            <Textarea id="materiel_necessaire" {...register('materiel_necessaire')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="conditions_annulation">Conditions d'annulation</Label>
            <Textarea id="conditions_annulation" {...register('conditions_annulation')} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label>Séances</Label>
                <p className="text-xs text-muted-foreground">
                  Les dates de début et de fin de la cohorte sont calculées automatiquement à partir des séances
                  ci-dessous (première et dernière) — c'est ce calendrier qui déclenche le passage à « En cours »
                  puis « Terminée ».
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ date_seance: '', heure_fin: '', lieu: '', titre_seance: '', type_seance: '', formateur_seance: '' })
                }
              >
                <Plus className="size-4" />
                Ajouter une séance
              </Button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Input type="datetime-local" {...register(`seances.${index}.date_seance` as const)} />
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
                  {errors.seances?.[index]?.date_seance && (
                    <p className="mt-1 text-xs text-destructive">{errors.seances[index]?.date_seance?.message}</p>
                  )}
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-muted-foreground">Détails avancés (optionnel)</summary>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Input placeholder="Heure de fin" type="time" {...register(`seances.${index}.heure_fin` as const)} />
                      <Input placeholder="Lieu" {...register(`seances.${index}.lieu` as const)} />
                      <Input placeholder="Titre de la séance" {...register(`seances.${index}.titre_seance` as const)} />
                      <Input placeholder="Type de séance" {...register(`seances.${index}.type_seance` as const)} />
                      <Input
                        placeholder="Formateur de la séance"
                        {...register(`seances.${index}.formateur_seance` as const)}
                      />
                    </div>
                  </details>
                </div>
              ))}
            </div>
            {errors.seances?.message && <p className="text-xs text-destructive">{errors.seances.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={creer.isPending}>
              {creer.isPending && <Loader2 className="size-4 animate-spin" />}
              Créer la cohorte
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
