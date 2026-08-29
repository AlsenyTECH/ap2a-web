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
} from '@/components/ui'
import { useModifierMembre, useSections } from '@/lib/queries'
import { fonctionAssociationLabel, statutAdhesionMeta } from '@/lib/utils/status'
import type { FonctionAssociation, MembreDetail, StatutAdhesion } from '@/lib/api/types'

const STATUTS_ADHESION: StatutAdhesion[] = ['ACTIF', 'SUSPENDU', 'EXPIRE']

const schema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  email: z.string().min(1, 'Email requis').email('Adresse email invalide'),
  telephone: z.string().optional(),
  fonction_association: z.string().min(1, 'Fonction requise'),
  id_section: z.coerce.number().optional(),
  statut_adhesion: z.enum(['ACTIF', 'SUSPENDU', 'EXPIRE']),
})

type FormValues = z.infer<typeof schema>

interface EditMembreDialogProps {
  membre: MembreDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditMembreDialog({ membre, open, onOpenChange }: EditMembreDialogProps) {
  const modifier = useModifierMembre()
  const { data: sections } = useSections()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const idSection = watch('id_section')
  const statutAdhesion = watch('statut_adhesion')
  const fonctionAssociation = watch('fonction_association')

  useEffect(() => {
    if (open && membre) {
      reset({
        nom: membre.nom,
        prenom: membre.prenom,
        email: membre.email,
        telephone: membre.telephone ?? '',
        fonction_association: membre.fonction_association,
        id_section: membre.id_section ?? undefined,
        statut_adhesion: membre.statut_adhesion,
      })
    }
  }, [open, membre, reset])

  async function onSubmit(values: FormValues) {
    if (!membre) return
    try {
      await modifier.mutateAsync({
        idMembre: membre.id_membre,
        nom: values.nom,
        prenom: values.prenom,
        email: values.email,
        telephone: values.telephone || null,
        fonction_association: values.fonction_association as FonctionAssociation,
        id_section: values.id_section ?? null,
        statut_adhesion: values.statut_adhesion,
      })
      onOpenChange(false)
    } catch {
      // géré par react-query (toast d'erreur)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-4 text-primary" />
            Modifier le membre
          </DialogTitle>
          <DialogDescription>
            Mettez à jour l'identité, les coordonnées et le statut d'adhésion de {membre?.prenom} {membre?.nom}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-nom">Nom</Label>
              <Input id="edit-nom" {...register('nom')} />
              {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-prenom">Prénom</Label>
              <Input id="edit-prenom" {...register('prenom')} />
              {errors.prenom && <p className="text-xs text-destructive">{errors.prenom.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-telephone">Téléphone (optionnel)</Label>
            <Input id="edit-telephone" {...register('telephone')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Fonction au sein d'AP2A</Label>
              <Select
                value={fonctionAssociation}
                onValueChange={(val: string) => setValue('fonction_association', val, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une fonction" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(fonctionAssociationLabel).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fonction_association && (
                <p className="text-xs text-destructive">{errors.fonction_association.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Section (optionnel)</Label>
              <Select
                value={idSection ? String(idSection) : ''}
                onValueChange={(val: string) => setValue('id_section', val ? Number(val) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aucune" />
                </SelectTrigger>
                <SelectContent>
                  {sections?.map((s) => (
                    <SelectItem key={s.id_section} value={String(s.id_section)}>
                      {s.nom_section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Statut d'adhésion</Label>
            <Select
              value={statutAdhesion}
              onValueChange={(val: string) => setValue('statut_adhesion', val as StatutAdhesion, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                {STATUTS_ADHESION.map((statut) => (
                  <SelectItem key={statut} value={statut}>
                    {statutAdhesionMeta(statut).label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={modifier.isPending}>
              {modifier.isPending && <Loader2 className="size-4 animate-spin mr-1.5" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
