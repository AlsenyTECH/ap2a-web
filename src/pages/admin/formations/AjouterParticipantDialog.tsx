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
import { useAjouterParticipant } from '@/lib/queries'

const schema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  telephone: z.string().optional(),
  numero_carte_identite: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface AjouterParticipantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  idCohorte: number
}

export function AjouterParticipantDialog({ open, onOpenChange, idCohorte }: AjouterParticipantDialogProps) {
  const ajouter = useAjouterParticipant()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nom: '', prenom: '', telephone: '', numero_carte_identite: '' },
  })

  useEffect(() => {
    if (open) reset({ nom: '', prenom: '', telephone: '', numero_carte_identite: '' })
  }, [open, reset])

  async function onSubmit(values: FormValues) {
    try {
      await ajouter.mutateAsync({
        idCohorte,
        payload: {
          nom: values.nom,
          prenom: values.prenom,
          telephone: values.telephone || undefined,
          numero_carte_identite: values.numero_carte_identite || undefined,
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
          <DialogTitle>Ajouter un participant</DialogTitle>
          <DialogDescription>Inscrire manuellement un participant à cette cohorte.</DialogDescription>
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
            <Label htmlFor="numero_carte_identite">N° carte d'identité (optionnel)</Label>
            <Input id="numero_carte_identite" {...register('numero_carte_identite')} />
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
