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
  Separator,
  Switch,
  Textarea,
} from '@/components/ui'
import { useAjouterBeneficiaire } from '@/lib/queries'
import type { TypeActionSociale } from '@/lib/api/types'

const schema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  telephone: z.string().optional(),
  sexe: z.string().optional(),
  date_naissance: z.string().optional(),
  numero_identification: z.string().optional(),
  adresse: z.string().optional(),
  notes: z.string().optional(),
  type_aide_recue: z.string().optional(),
  // COMMERCE
  type_commerce: z.string().optional(),
  localisation_commerce: z.string().optional(),
  capital_depart_fourni: z.string().optional(),
  montant_accompagnement: z.string().optional(),
  // ATELIER
  domaine_atelier: z.string().optional(),
  equipement_fourni: z.string().optional(),
  local_mis_a_disposition: z.boolean().optional(),
  // MEDICAL
  type_soin: z.string().optional(),
  date_consultation: z.string().optional(),
  medecin_referent: z.string().optional(),
  traitement_fourni: z.string().optional(),
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
  notes: '',
  type_aide_recue: '',
  type_commerce: '',
  localisation_commerce: '',
  capital_depart_fourni: '',
  montant_accompagnement: '',
  domaine_atelier: '',
  equipement_fourni: '',
  local_mis_a_disposition: false,
  type_soin: '',
  date_consultation: '',
  medecin_referent: '',
  traitement_fourni: '',
}

interface AjouterBeneficiaireDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  idAction: number
  typeAction: TypeActionSociale
}

export function AjouterBeneficiaireDialog({ open, onOpenChange, idAction, typeAction }: AjouterBeneficiaireDialogProps) {
  const ajouter = useAjouterBeneficiaire()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY_VALUES })

  const localMisADisposition = watch('local_mis_a_disposition')

  useEffect(() => {
    if (open) reset(EMPTY_VALUES)
  }, [open, reset])

  async function onSubmit(values: FormValues) {
    try {
      await ajouter.mutateAsync({
        idAction,
        payload: {
          nom: values.nom,
          prenom: values.prenom,
          telephone: values.telephone || undefined,
          sexe: values.sexe || undefined,
          date_naissance: values.date_naissance || undefined,
          numero_identification: values.numero_identification || undefined,
          adresse: values.adresse || undefined,
          notes: values.notes || undefined,
          type_aide_recue: values.type_aide_recue || undefined,
          ...(typeAction === 'COMMERCE' && {
            type_commerce: values.type_commerce || undefined,
            localisation_commerce: values.localisation_commerce || undefined,
            capital_depart_fourni: values.capital_depart_fourni || undefined,
            montant_accompagnement: values.montant_accompagnement || undefined,
          }),
          ...(typeAction === 'ATELIER' && {
            domaine_atelier: values.domaine_atelier || undefined,
            equipement_fourni: values.equipement_fourni || undefined,
            local_mis_a_disposition: values.local_mis_a_disposition,
          }),
          ...(typeAction === 'MEDICAL' && {
            type_soin: values.type_soin || undefined,
            date_consultation: values.date_consultation || undefined,
            medecin_referent: values.medecin_referent || undefined,
            traitement_fourni: values.traitement_fourni || undefined,
          }),
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
          <DialogTitle>Ajouter un bénéficiaire</DialogTitle>
          <DialogDescription>Inscrire un bénéficiaire à cette action sociale.</DialogDescription>
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
              <Label htmlFor="sexe">Sexe</Label>
              <Input id="sexe" placeholder="M / F" {...register('sexe')} />
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
          <div className="space-y-1.5">
            <Label htmlFor="type_aide_recue">Type d'aide reçue</Label>
            <Input id="type_aide_recue" {...register('type_aide_recue')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register('notes')} />
          </div>

          {typeAction === 'COMMERCE' && (
            <>
              <Separator />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Aide au commerce</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="type_commerce">Type de commerce</Label>
                  <Input id="type_commerce" {...register('type_commerce')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="localisation_commerce">Localisation</Label>
                  <Input id="localisation_commerce" {...register('localisation_commerce')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="capital_depart_fourni">Capital de départ fourni</Label>
                  <Input id="capital_depart_fourni" {...register('capital_depart_fourni')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="montant_accompagnement">Montant d'accompagnement</Label>
                  <Input id="montant_accompagnement" {...register('montant_accompagnement')} />
                </div>
              </div>
            </>
          )}

          {typeAction === 'ATELIER' && (
            <>
              <Separator />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Atelier</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="domaine_atelier">Domaine de l'atelier</Label>
                  <Input id="domaine_atelier" {...register('domaine_atelier')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="equipement_fourni">Équipement fourni</Label>
                  <Input id="equipement_fourni" {...register('equipement_fourni')} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="local_mis_a_disposition"
                  checked={localMisADisposition}
                  onCheckedChange={(v) => setValue('local_mis_a_disposition', v)}
                />
                <Label htmlFor="local_mis_a_disposition">Local mis à disposition</Label>
              </div>
            </>
          )}

          {typeAction === 'MEDICAL' && (
            <>
              <Separator />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Aide médicale</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="type_soin">Type de soin</Label>
                  <Input id="type_soin" {...register('type_soin')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="date_consultation">Date de consultation</Label>
                  <Input id="date_consultation" type="date" {...register('date_consultation')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="medecin_referent">Médecin référent</Label>
                  <Input id="medecin_referent" {...register('medecin_referent')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="traitement_fourni">Traitement fourni</Label>
                  <Input id="traitement_fourni" {...register('traitement_fourni')} />
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={ajouter.isPending}>
              {ajouter.isPending && <Loader2 className="size-4 animate-spin" />}
              Ajouter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
