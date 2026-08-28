import { useState } from 'react'
import { CalendarDays, Loader2 } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  EmptyState,
  Skeleton,
} from '@/components/ui'
import { useAnnulerConfirmation, useConfirmerEvenement, useMesEvenements } from '@/lib/queries'
import { formatDateTime } from '@/lib/utils/format'
import { modeInscriptionLabel, statutConfirmationMeta, typeEvenementLabel } from '@/lib/utils/status'
import type { EvenementMembre } from '@/lib/api/types'

export default function MesEvenements() {
  const { data: evenements, isLoading } = useMesEvenements()
  const confirmer = useConfirmerEvenement()
  const annuler = useAnnulerConfirmation()
  const [evenementAnnulation, setEvenementAnnulation] = useState<EvenementMembre | null>(null)

  async function handleAnnuler() {
    if (!evenementAnnulation) return
    try {
      await annuler.mutateAsync(evenementAnnulation.id_evenement)
    } finally {
      setEvenementAnnulation(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    )
  }

  if (!evenements || evenements.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Aucun événement à venir"
        description="Il n'y a pas d'événement prévu pour le moment."
      />
    )
  }

  return (
    <div className="space-y-4">
      {evenements.map((evenement) => {
        const statut = evenement.mon_statut === 'ANNULE' ? null : evenement.mon_statut
        const confMeta = statut ? statutConfirmationMeta(statut) : null

        return (
          <Card key={evenement.id_evenement}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{evenement.titre}</CardTitle>
                  <CardDescription>{evenement.lieu}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">{typeEvenementLabel[evenement.type_evenement] ?? evenement.type_evenement}</Badge>
                  <Badge variant="secondary">{modeInscriptionLabel[evenement.mode_inscription]}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {evenement.description && <p className="text-sm text-muted-foreground">{evenement.description}</p>}

              {evenement.seances.length > 0 && (
                <ul className="space-y-1 text-sm text-foreground">
                  {evenement.seances.map((s) => (
                    <li key={s.id_seance}>
                      Séance {s.numero_ordre} — {formatDateTime(s.date_seance)}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {confMeta && <Badge variant={confMeta.variant}>{confMeta.label}</Badge>}

                {!statut && (
                  <Button
                    size="sm"
                    disabled={confirmer.isPending}
                    onClick={() => confirmer.mutate(evenement.id_evenement)}
                  >
                    {confirmer.isPending && <Loader2 className="size-4 animate-spin" />}
                    Confirmer ma présence
                  </Button>
                )}

                {(statut === 'CONFIRME' || statut === 'LISTE_ATTENTE') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEvenementAnnulation(evenement)}
                  >
                    Annuler
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}

      <ConfirmDialog
        open={evenementAnnulation !== null}
        onOpenChange={(open) => !open && setEvenementAnnulation(null)}
        title="Annuler ma confirmation"
        description={`Vous ne serez plus inscrit à "${evenementAnnulation?.titre ?? ''}".`}
        confirmLabel="Annuler ma confirmation"
        variant="destructive"
        loading={annuler.isPending}
        onConfirm={handleAnnuler}
      />
    </div>
  )
}
