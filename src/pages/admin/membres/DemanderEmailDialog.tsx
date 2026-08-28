import { useState } from 'react'
import { Loader2, Mail } from 'lucide-react'
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

interface DemanderEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (email: string) => void
  loading?: boolean
}

/**
 * Ce membre n'a pas encore d'adresse email réelle (compte créé sans
 * email lors de l'ajout manuel) : on ne peut pas lui envoyer ses
 * identifiants tant qu'on n'en connaît pas une. Ce prompt la demande
 * puis rejoue l'envoi avec l'adresse fournie.
 */
export function DemanderEmailDialog({ open, onOpenChange, onConfirm, loading }: DemanderEmailDialogProps) {
  const [email, setEmail] = useState('')
  const valide = /\S+@\S+\.\S+/.test(email)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setEmail('')
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="size-4 text-primary" />
            Adresse email requise
          </DialogTitle>
          <DialogDescription>
            Ce membre n'a pas encore d'adresse email enregistrée. Renseignez-en une pour lui envoyer ses identifiants
            de connexion — elle sera enregistrée sur son compte.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="email-membre">Adresse email</Label>
          <Input
            id="email-membre"
            type="email"
            autoFocus
            placeholder="jean.dupont@exemple.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="button" disabled={!valide || loading} onClick={() => onConfirm(email.trim())}>
            {loading && <Loader2 className="size-4 animate-spin mr-1.5" />}
            Envoyer les identifiants
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
