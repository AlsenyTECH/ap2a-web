import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Gift, Loader2, Stethoscope } from 'lucide-react'
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
  Textarea,
} from '@/components/ui'
import { useMettreAJourSuiviMedical, useModifierParticipation } from '@/lib/queries'
import { useAuth } from '@/lib/auth/AuthContext'
import type { ActionSocialeDetail, TypeActionSociale } from '@/lib/api/types'

type Beneficiaire = ActionSocialeDetail['beneficiaires'][number]

const STATUT_OPTIONS: Array<{ value: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'ABANDON'; label: string }> = [
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'EN_COURS', label: 'En cours de suivi' },
  { value: 'TERMINE', label: 'Terminé avec succès' },
  { value: 'ABANDON', label: 'Abandonné' },
]

const schema = z.object({
  statut: z.enum(['EN_ATTENTE', 'EN_COURS', 'TERMINE', 'ABANDON']),
  type_aide_recue: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const EMPTY_VALUES: FormValues = {
  statut: 'EN_ATTENTE',
  type_aide_recue: '',
  notes: '',
}

const medicalSchema = z.object({
  a_ete_visite: z.boolean(),
  necessite_traitement: z.boolean(),
  description_besoin_traitement: z.string().optional(),
  traitement_effectue: z.boolean(),
  notes_suivi: z.string().optional(),
})

type MedicalFormValues = z.infer<typeof medicalSchema>

const MEDICAL_EMPTY_VALUES: MedicalFormValues = {
  a_ete_visite: false,
  necessite_traitement: false,
  description_besoin_traitement: '',
  traitement_effectue: false,
  notes_suivi: '',
}

interface SuiviParticipationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  idAction: number
  typeAction?: TypeActionSociale
  beneficiaire: Beneficiaire | null
}

export function SuiviParticipationDialog({
  open,
  onOpenChange,
  idAction,
  typeAction,
  beneficiaire,
}: SuiviParticipationDialogProps) {
  const { hasPermission } = useAuth()

  if (typeAction === 'MEDICAL' && !hasPermission('DONNEES_MEDICALES')) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Suivi médical</DialogTitle>
            <DialogDescription>
              Le suivi médical contient des données de santé : il demande la permission « Données médicales ».
              Demandez-la au super administrateur.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  if (typeAction === 'MEDICAL') {
    return (
      <SuiviMedicalDialog open={open} onOpenChange={onOpenChange} idAction={idAction} beneficiaire={beneficiaire} />
    )
  }

  return (
    <SuiviGeneriqueDialog open={open} onOpenChange={onOpenChange} idAction={idAction} beneficiaire={beneficiaire} />
  )
}

function SuiviGeneriqueDialog({
  open,
  onOpenChange,
  idAction,
  beneficiaire,
}: Omit<SuiviParticipationDialogProps, 'typeAction'>) {
  const modifier = useModifierParticipation()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY_VALUES })

  const statut = watch('statut')

  useEffect(() => {
    if (!open) return
    if (beneficiaire) {
      reset({
        statut: (beneficiaire.statut as FormValues['statut']) || 'EN_ATTENTE',
        type_aide_recue: beneficiaire.type_aide_recue ?? '',
        notes: beneficiaire.notes ?? '',
      })
    } else {
      reset(EMPTY_VALUES)
    }
  }, [open, beneficiaire, reset])

  async function onSubmit(values: FormValues) {
    if (!beneficiaire) return
    try {
      await modifier.mutateAsync({
        idAction,
        idParticipation: beneficiaire.id_participation,
        payload: {
          statut: values.statut,
          type_aide_recue: values.type_aide_recue || undefined,
          notes: values.notes || undefined,
        },
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
          <DialogTitle>Suivi du bénéficiaire</DialogTitle>
          <DialogDescription>
            {beneficiaire ? `${beneficiaire.prenom} ${beneficiaire.nom}` : ''} — mettre à jour le statut et l'aide reçue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label>Statut du suivi</Label>
            <Select value={statut} onValueChange={(v) => setValue('statut', v as FormValues['statut'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.statut && <p className="text-xs text-destructive">{errors.statut.message}</p>}
          </div>

          <div className="space-y-1.5 rounded-md border border-primary/40 bg-primary/5 p-3">
            <Label htmlFor="type_aide_recue" className="flex items-center gap-1.5">
              <Gift className="size-4 text-primary" />
              Aide reçue
            </Label>
            <Input
              id="type_aide_recue"
              placeholder="ex. Kit de démarrage, Consultation médicale…"
              {...register('type_aide_recue')}
            />
            <p className="text-xs text-muted-foreground">
              Précisez concrètement ce que le bénéficiaire a reçu dans le cadre de cette action.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Observations complémentaires…" {...register('notes')} />
          </div>

          <DialogFooter>
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

function SuiviMedicalDialog({
  open,
  onOpenChange,
  idAction,
  beneficiaire,
}: Omit<SuiviParticipationDialogProps, 'typeAction'>) {
  const mettreAJour = useMettreAJourSuiviMedical()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<MedicalFormValues>({ resolver: zodResolver(medicalSchema), defaultValues: MEDICAL_EMPTY_VALUES })

  const aEteVisite = watch('a_ete_visite')
  const necessiteTraitement = watch('necessite_traitement')
  const traitementEffectue = watch('traitement_effectue')

  useEffect(() => {
    if (!open) return
    const detail = beneficiaire?.detail_medical
    reset({
      a_ete_visite: detail?.a_ete_visite ?? false,
      necessite_traitement: detail?.necessite_traitement ?? false,
      description_besoin_traitement: detail?.description_besoin_traitement ?? '',
      traitement_effectue: detail?.traitement_effectue ?? false,
      notes_suivi: detail?.notes_suivi ?? '',
    })
  }, [open, beneficiaire, reset])

  async function onSubmit(values: MedicalFormValues) {
    if (!beneficiaire) return
    try {
      await mettreAJour.mutateAsync({
        idAction,
        idParticipation: beneficiaire.id_participation,
        payload: {
          a_ete_visite: values.a_ete_visite,
          necessite_traitement: values.necessite_traitement,
          description_besoin_traitement: values.description_besoin_traitement || undefined,
          traitement_effectue: values.traitement_effectue,
          notes_suivi: values.notes_suivi || undefined,
        },
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
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="size-5 text-primary" />
            Suivi médical
          </DialogTitle>
          <DialogDescription>
            {beneficiaire ? `${beneficiaire.prenom} ${beneficiaire.nom}` : ''} — visite, besoin de traitement et suivi.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <label className="flex items-center gap-2.5 rounded-md border border-border p-3 cursor-pointer">
            <Checkbox
              checked={aEteVisite}
              onCheckedChange={(v) => setValue('a_ete_visite', v === true)}
            />
            <span className="text-sm font-medium">Patient examiné / visité</span>
          </label>

          <label className="flex items-center gap-2.5 rounded-md border border-border p-3 cursor-pointer">
            <Checkbox
              checked={necessiteTraitement}
              onCheckedChange={(v) => setValue('necessite_traitement', v === true)}
            />
            <span className="text-sm font-medium">Nécessite un traitement médical</span>
          </label>

          {necessiteTraitement && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="description_besoin_traitement">Description du traitement / besoin</Label>
                <Textarea id="description_besoin_traitement" {...register('description_besoin_traitement')} />
              </div>

              <label className="flex items-center gap-2.5 rounded-md border border-border p-3 cursor-pointer">
                <Checkbox
                  checked={traitementEffectue}
                  onCheckedChange={(v) => setValue('traitement_effectue', v === true)}
                />
                <span className="text-sm font-medium">Traitement dispensé / effectué</span>
              </label>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="notes_suivi">Notes de suivi</Label>
            <Textarea id="notes_suivi" placeholder="Observations complémentaires…" {...register('notes_suivi')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={mettreAJour.isPending}>
              {mettreAJour.isPending && <Loader2 className="size-4 animate-spin" />}
              Enregistrer le suivi médical
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
