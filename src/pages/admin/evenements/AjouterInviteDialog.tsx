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
} from '@/components/ui'
import { useAjouterInvite } from '@/lib/queries'

const schema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  telephone: z.string().optional(),
  organisation: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface AjouterInviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  idEvenement: number
}

export function AjouterInviteDialog({ open, onOpenChange, idEvenement }: AjouterInviteDialogProps) {
  const ajouter = useAjouterInvite()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nom: '', prenom: '', telephone: '', organisation: '' },
  })

  useEffect(() => {
    if (open) reset({ nom: '', prenom: '', telephone: '', organisation: '' })
  }, [open, reset])

  async function onSubmit(values: FormValues) {
    try {
      await ajouter.mutateAsync({
        idEvenement,
        payload: {
          nom: values.nom,
          prenom: values.prenom,
          telephone: values.telephone || undefined,
          organisation: values.organisation || undefined,
        },
      })
      onOpenChange(false)
    } catch {
      // erreur déjà toastée par le hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un invité</DialogTitle>
          <DialogDescription>Inscrire manuellement une personne externe à cet événement.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="telephone">Téléphone (optionnel)</Label>
            <Input id="telephone" {...register('telephone')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="organisation">Organisation (optionnel)</Label>
            <Input id="organisation" {...register('organisation')} />
          </div>
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
