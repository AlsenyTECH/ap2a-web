import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
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
import { useCreerSuivi } from '@/lib/queries'
import { moyenContactLabel, statutGlobalSuiviMeta } from '@/lib/utils/status'
import type { MoyenContact, StatutGlobalSuivi } from '@/lib/api/types'

const schema = z.object({
  moyen_contact: z.string(),
  kit_remis: z.boolean(),
  certificat_emis: z.boolean(),
  activite_lancee: z.boolean(),
  type_activite: z.string().optional(),
  localisation_activite: z.string().optional(),
  difficultes: z.string().optional(),
  niveau_satisfaction: z.string(),
  statut_global: z.string(),
  recommandations: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const STATUT_GLOBAL_OPTIONS: StatutGlobalSuivi[] = ['EN_COURS', 'STABLE', 'ABANDONNE', 'SUCCES']

const EMPTY_VALUES: FormValues = {
  moyen_contact: 'VISITE',
  kit_remis: false,
  certificat_emis: false,
  activite_lancee: false,
  type_activite: '',
  localisation_activite: '',
  difficultes: '',
  niveau_satisfaction: 'NONE',
  statut_global: 'EN_COURS',
  recommandations: '',
}

interface NouveauSuiviDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  idParticipant: number | null
  idCohorte: number | null
  participantNom?: string
}

export function NouveauSuiviDialog({
  open,
  onOpenChange,
  idParticipant,
  idCohorte,
  participantNom,
}: NouveauSuiviDialogProps) {
  const creerSuivi = useCreerSuivi()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY_VALUES })

  useEffect(() => {
    if (open) reset(EMPTY_VALUES)
  }, [open, reset])

  const moyenContact = watch('moyen_contact')
  const statutGlobal = watch('statut_global')
  const niveauSatisfaction = watch('niveau_satisfaction')
  const activiteLancee = watch('activite_lancee')

  async function onSubmit(values: FormValues) {
    if (idParticipant === null || idCohorte === null) return
    try {
      await creerSuivi.mutateAsync({
        id_participant: idParticipant,
        id_cohorte: idCohorte,
        moyen_contact: values.moyen_contact ? (values.moyen_contact as MoyenContact) : undefined,
        kit_remis: values.kit_remis,
        certificat_emis: values.certificat_emis,
        activite_lancee: values.activite_lancee,
        type_activite: values.activite_lancee ? values.type_activite || undefined : undefined,
        localisation_activite: values.activite_lancee ? values.localisation_activite || undefined : undefined,
        difficultes: values.difficultes || undefined,
        niveau_satisfaction: values.niveau_satisfaction !== 'NONE' ? Number(values.niveau_satisfaction) : undefined,
        statut_global: values.statut_global ? (values.statut_global as StatutGlobalSuivi) : undefined,
        recommandations: values.recommandations || undefined,
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
          <DialogTitle>Nouvelle fiche de suivi</DialogTitle>
          <DialogDescription>
            {participantNom ? `Pour ${participantNom}.` : 'Enregistrer un contact de suivi post-formation.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="max-h-[75vh] space-y-4 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label>Moyen de contact</Label>
            <Select value={moyenContact} onValueChange={(v) => setValue('moyen_contact', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un moyen" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(moyenContactLabel).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Checkbox
                id="kit_remis"
                checked={watch('kit_remis')}
                onCheckedChange={(v) => setValue('kit_remis', v === true)}
              />
              <Label htmlFor="kit_remis" className="font-normal">
                Kit remis
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="certificat_emis"
                checked={watch('certificat_emis')}
                onCheckedChange={(v) => setValue('certificat_emis', v === true)}
              />
              <Label htmlFor="certificat_emis" className="font-normal">
                Certificat émis
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="activite_lancee"
                checked={activiteLancee}
                onCheckedChange={(v) => setValue('activite_lancee', v === true)}
              />
              <Label htmlFor="activite_lancee" className="font-normal">
                Activité lancée
              </Label>
            </div>
          </div>

          {activiteLancee && (
            <div className="grid grid-cols-2 gap-3 rounded-md border border-border p-3">
              <div className="space-y-1.5">
                <Label htmlFor="type_activite">Type d'activité</Label>
                <Input id="type_activite" {...register('type_activite')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="localisation_activite">Localisation</Label>
                <Input id="localisation_activite" {...register('localisation_activite')} />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="difficultes">Difficultés rencontrées</Label>
            <Textarea id="difficultes" {...register('difficultes')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Niveau de satisfaction</Label>
              <Select value={niveauSatisfaction} onValueChange={(v) => setValue('niveau_satisfaction', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Non renseigné</SelectItem>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} / 5
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Statut global</Label>
              <Select value={statutGlobal} onValueChange={(v) => setValue('statut_global', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUT_GLOBAL_OPTIONS.map((statut) => (
                    <SelectItem key={statut} value={statut}>
                      {statutGlobalSuiviMeta(statut).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recommandations">Recommandations</Label>
            <Textarea id="recommandations" {...register('recommandations')} />
            {errors.recommandations && (
              <p className="text-xs text-destructive">{errors.recommandations.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={creerSuivi.isPending}>
              {creerSuivi.isPending && <Loader2 className="size-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
