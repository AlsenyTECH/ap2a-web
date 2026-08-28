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
import { useModifierBeneficiaire } from '@/lib/queries'
import type { ActionSocialeDetail } from '@/lib/api/types'

type Beneficiaire = ActionSocialeDetail['beneficiaires'][number]

const SEXE_NON_PRECISE = 'NC'

const schema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  telephone: z.string().optional(),
  sexe: z.string().optional(),
  date_naissance: z.string().optional(),
  numero_identification: z.string().optional(),
  adresse: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const EMPTY_VALUES: FormValues = {
  nom: '',
  prenom: '',
  telephone: '',
  sexe: '',
  date_naissance: '',
  numero_identification: '',
  adresse: '',
}

interface ModifierBeneficiaireDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  idAction: number
  beneficiaire: Beneficiaire | null
}

export function ModifierBeneficiaireDialog({
  open,
  onOpenChange,
  idAction,
  beneficiaire,
}: ModifierBeneficiaireDialogProps) {
  const modifier = useModifierBeneficiaire()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY_VALUES })

  const sexe = watch('sexe')

  useEffect(() => {
    if (!open) return
    if (beneficiaire) {
      reset({
        nom: beneficiaire.nom,
        prenom: beneficiaire.prenom,
        telephone: beneficiaire.telephone ?? '',
        sexe: beneficiaire.sexe ?? '',
        date_naissance: beneficiaire.date_naissance ?? '',
        numero_identification: beneficiaire.numero_identification ?? '',
        adresse: beneficiaire.adresse ?? '',
      })
    } else {
      reset(EMPTY_VALUES)
    }
  }, [open, beneficiaire, reset])

  async function onSubmit(values: FormValues) {
    if (!beneficiaire) return
    try {
      await modifier.mutateAsync({
        idBeneficiaire: beneficiaire.id_beneficiaire,
        idAction,
        payload: {
          nom: values.nom,
          prenom: values.prenom,
          telephone: values.telephone || undefined,
          sexe: values.sexe || undefined,
          date_naissance: values.date_naissance || undefined,
          numero_identification: values.numero_identification || undefined,
          adresse: values.adresse || undefined,
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
          <DialogTitle>Modifier le bénéficiaire</DialogTitle>
          <DialogDescription>Mettre à jour les informations d'identité du bénéficiaire.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nom">Nom</Label>
              <Input id="nom" {...register('nom')} />
              {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prenom">Prénom</Label>
              <Input id="prenom" {...register('prenom')} />
              {errors.prenom && <p className="text-xs text-destructive">{errors.prenom.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input id="telephone" {...register('telephone')} />
            </div>
            <div className="space-y-1.5">
              <Label>Sexe</Label>
              <Select
                value={sexe || SEXE_NON_PRECISE}
                onValueChange={(v) => setValue('sexe', v === SEXE_NON_PRECISE ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEXE_NON_PRECISE}>Non précisé</SelectItem>
                  <SelectItem value="M">Masculin</SelectItem>
                  <SelectItem value="F">Féminin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date_naissance">Date de naissance</Label>
              <Input id="date_naissance" type="date" {...register('date_naissance')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="numero_identification">N° d'identification</Label>
              <Input id="numero_identification" {...register('numero_identification')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adresse">Adresse</Label>
            <Input id="adresse" {...register('adresse')} />
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
