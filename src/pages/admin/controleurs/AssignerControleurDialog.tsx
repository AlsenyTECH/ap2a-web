import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { useAssignerControleur, useEvenements } from '@/lib/queries'
import type { Controleur } from '@/lib/api/types'

interface AssignerControleurDialogProps {
  controleur: Controleur | null
  onOpenChange: (open: boolean) => void
}

export function AssignerControleurDialog({ controleur, onOpenChange }: AssignerControleurDialogProps) {
  const [idEvenement, setIdEvenement] = useState('')
  const { data: evenements, isLoading } = useEvenements()
  const assignerControleur = useAssignerControleur()

  useEffect(() => {
    setIdEvenement('')
  }, [controleur])

  function handleClose(next: boolean) {
    onOpenChange(next)
  }

  function handleAssigner() {
    if (!controleur || !idEvenement) return
    assignerControleur.mutate(
      { id: controleur.id_controleur, idEvenement: Number(idEvenement) },
      { onSuccess: () => handleClose(false) },
    )
  }

  return (
    <Dialog open={controleur !== null} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assigner à un événement</DialogTitle>
          <DialogDescription>
            {controleur ? `${controleur.prenom} ${controleur.nom}` : 'Ce contrôleur'} sera habilité(e) à
            scanner pour l'événement choisi. S'il n'était assigné à aucun événement (ex : après la clôture
            du précédent), cette action lui redonne le droit de scanner — sans affecter le reste de son
            compte (accès membre ou admin éventuels).
          </DialogDescription>
        </DialogHeader>

        <Select value={idEvenement} onValueChange={setIdEvenement} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir un événement" />
          </SelectTrigger>
          <SelectContent>
            {evenements?.map((evt) => (
              <SelectItem key={evt.id_evenement} value={String(evt.id_evenement)}>
                {evt.titre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleClose(false)}>
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleAssigner}
            disabled={!idEvenement || assignerControleur.isPending}
          >
            {assignerControleur.isPending && <Loader2 className="animate-spin" />}
            Assigner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
