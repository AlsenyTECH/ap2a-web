import { useEffect, useState } from 'react'
import { Loader2, Lock } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { useMutationFiche } from '@/lib/queries'
import { actionsApi } from '@/lib/api/actions'
import { momentIndicateurLabel } from '@/lib/utils/status'
import type { ActionCibleLigne, ActionFiche, MomentIndicateur, ValeurIndicateurJson } from '@/lib/api/types'
import { ChampIndicateur } from './ChampIndicateur'

const MOMENTS: MomentIndicateur[] = ['REFERENCE', 'INTERVENTION', 'SUIVI']

interface SaisieIndicateursDialogProps {
  action: ActionFiche
  /** Une cible : ses indicateurs « par cible » ; null : indicateurs de l'action entière. */
  ligne: ActionCibleLigne | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaisieIndicateursDialog({ action, ligne, open, onOpenChange }: SaisieIndicateursDialogProps) {
  const enregistrer = useMutationFiche(action.id_action, (valeurs: Parameters<typeof actionsApi.enregistrerValeurs>[1]) =>
    actionsApi.enregistrerValeurs(action.id_action, valeurs), 'Indicateurs enregistrés')
  const [valeurs, setValeurs] = useState<Record<string, ValeurIndicateurJson>>({})

  const niveau = ligne ? 'CIBLE' : 'ACTION'
  const cloturee = action.statut === 'TERMINEE' || action.statut === 'ANNULEE'
  const indicateurs = action.indicateurs.filter((i) => i.niveau === niveau)

  useEffect(() => {
    if (open) setValeurs({ ...(ligne ? ligne.valeurs : action.valeurs_action) })
  }, [open, ligne, action])

  async function valider() {
    const initiales = ligne ? ligne.valeurs : action.valeurs_action
    const modifiees = indicateurs
      .filter((i) => (valeurs[i.id_indicateur] ?? null) !== (initiales[i.id_indicateur] ?? null))
      .map((i) => ({
        indicateur: i.id_indicateur,
        action_cible: ligne?.id_action_cible ?? null,
        valeur: valeurs[i.id_indicateur] ?? null,
      }))
    try {
      if (modifiees.length) await enregistrer.mutateAsync(modifiees)
      onOpenChange(false)
    } catch {
      // toast déjà affiché
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{ligne ? ligne.nom_complet : "Indicateurs de l'action"}</DialogTitle>
          <DialogDescription>{action.type_action_libelle}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[65vh] space-y-5 overflow-y-auto pr-1">
          {indicateurs.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun indicateur à ce niveau pour ce type d'action.</p>
          )}
          {MOMENTS.map((moment) => {
            const groupe = indicateurs.filter((i) => i.moment === moment)
            if (!groupe.length) return null
            return (
              <section key={moment} className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {momentIndicateurLabel[moment]}
                </h3>
                {groupe.map((i) => (
                  <ChampIndicateur
                    key={i.id_indicateur}
                    indicateur={i}
                    valeur={valeurs[i.id_indicateur]}
                    desactive={cloturee && moment !== 'SUIVI'}
                    onChange={(val) => setValeurs((v) => ({ ...v, [i.id_indicateur]: val }))}
                  />
                ))}
              </section>
            )
          })}
          {action.indicateurs_masques && (
            <p className="flex items-center gap-2 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
              <Lock className="size-3.5" />
              Les indicateurs médicaux sont masqués (permission « Données médicales »).
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={valider} disabled={enregistrer.isPending || indicateurs.length === 0}>
            {enregistrer.isPending && <Loader2 className="size-4 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
