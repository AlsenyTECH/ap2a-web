import { useEffect, useState } from 'react'
import { Copy, KeyRound, Loader2, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { useReinitialiserMotDePasseControleur } from '@/lib/queries'
import type { Controleur } from '@/lib/api/types'

interface ReinitialiserMotDePasseDialogProps {
  controleur: Controleur | null
  onOpenChange: (open: boolean) => void
}

interface Resultat {
  email: string
  mot_de_passe_temporaire: string
}

export function ReinitialiserMotDePasseDialog({
  controleur,
  onOpenChange,
}: ReinitialiserMotDePasseDialogProps) {
  const [resultat, setResultat] = useState<Resultat | null>(null)
  const reinitialiser = useReinitialiserMotDePasseControleur()

  useEffect(() => {
    setResultat(null)
  }, [controleur])

  function handleClose(next: boolean) {
    onOpenChange(next)
  }

  function handleConfirm() {
    if (!controleur) return
    reinitialiser.mutate(controleur.id_controleur, {
      onSuccess: (data) => setResultat(data),
    })
  }

  async function handleCopy() {
    if (!resultat) return
    try {
      await navigator.clipboard.writeText(resultat.mot_de_passe_temporaire)
      toast.success('Mot de passe copié')
    } catch {
      toast.error('Copie impossible — sélectionnez le mot de passe manuellement')
    }
  }

  const open = controleur !== null

  if (resultat) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau mot de passe généré</DialogTitle>
            <DialogDescription>Compte {resultat.email}</DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-border bg-muted p-4 text-center">
            <p className="break-all font-mono text-xl font-semibold text-foreground">
              {resultat.mot_de_passe_temporaire}
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-foreground">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
            <p>Ce mot de passe ne sera plus affiché ensuite — communiquez-le maintenant au contrôleur.</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCopy}>
              <Copy />
              Copier
            </Button>
            <Button type="button" onClick={() => handleClose(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
          <DialogDescription>
            Un nouveau mot de passe temporaire sera généré pour{' '}
            {controleur ? `${controleur.prenom} ${controleur.nom}` : 'ce contrôleur'}. Son mot de passe
            actuel cessera immédiatement de fonctionner.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={reinitialiser.isPending}
          >
            Annuler
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={reinitialiser.isPending}>
            {reinitialiser.isPending ? <Loader2 className="animate-spin" /> : <KeyRound />}
            Réinitialiser
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
