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
} from '@/components/ui'
import { useModifierParticipant } from '@/lib/queries'
import type { ParticipantCohorteListItem } from '@/lib/api/types'

const schema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  telephone: z.string().optional(),
  numero_carte_identite: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface EditParticipantDialogProps {
  participant: ParticipantCohorteListItem | null
  idCohorte: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditParticipantDialog({ participant, idCohorte, open, onOpenChange }: EditParticipantDialogProps) {
  const modifier = useModifierParticipant()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open && participant) {
      reset({
        nom: participant.nom,
        prenom: participant.prenom,
        telephone: participant.telephone ?? '',
        numero_carte_identite: participant.numero_carte_identite ?? '',
      })
    }
  }, [open, participant, reset])

  async function onSubmit(values: FormValues) {
    if (!participant) return
    try {
      await modifier.mutateAsync({
        idParticipant: participant.id_participant,
        idCohorte,
        payload: {
          nom: values.nom,
          prenom: values.prenom,
          telephone: values.telephone || '',
          numero_carte_identite: values.numero_carte_identite || '',
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
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-4 text-primary" />
            Modifier le participant
          </DialogTitle>
          <DialogDescription>Corrigez l'identité de {participant?.prenom} {participant?.nom}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-participant-nom">Nom</Label>
              <Input id="edit-participant-nom" {...register('nom')} />
              {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-participant-prenom">Prénom</Label>
              <Input id="edit-participant-prenom" {...register('prenom')} />
              {errors.prenom && <p className="text-xs text-destructive">{errors.prenom.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-participant-telephone">Téléphone (optionnel)</Label>
            <Input id="edit-participant-telephone" {...register('telephone')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-participant-cni">N° carte d'identité (optionnel)</Label>
            <Input id="edit-participant-cni" {...register('numero_carte_identite')} />
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
