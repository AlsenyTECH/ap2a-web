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
import { useModifierControleur } from '@/lib/queries'
import type { Controleur } from '@/lib/api/types'

interface EditControleurDialogProps {
  controleur: Controleur | null
  onOpenChange: (open: boolean) => void
}

const editSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  email: z.string().email('Adresse email invalide'),
})

type EditFormValues = z.infer<typeof editSchema>

export function EditControleurDialog({ controleur, onOpenChange }: EditControleurDialogProps) {
  const modifierControleur = useModifierControleur()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormValues>({ resolver: zodResolver(editSchema) })

  useEffect(() => {
    if (controleur) {
      reset({ nom: controleur.nom, prenom: controleur.prenom, email: controleur.email })
    }
  }, [controleur, reset])

  function handleClose(next: boolean) {
    onOpenChange(next)
  }

  function onSubmit(values: EditFormValues) {
    if (!controleur) return
    modifierControleur.mutate(
      { id: controleur.id_controleur, payload: values },
      { onSuccess: () => handleClose(false) },
    )
  }

  return (
    <Dialog open={controleur !== null} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le contrôleur</DialogTitle>
          <DialogDescription>Nom, prénom et email du compte contrôleur.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-controleur-nom">Nom</Label>
              <Input id="edit-controleur-nom" {...register('nom')} />
              {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-controleur-prenom">Prénom</Label>
              <Input id="edit-controleur-prenom" {...register('prenom')} />
              {errors.prenom && <p className="text-xs text-destructive">{errors.prenom.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-controleur-email">Email</Label>
            <Input id="edit-controleur-email" type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={modifierControleur.isPending}>
              {modifierControleur.isPending && <Loader2 className="animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
