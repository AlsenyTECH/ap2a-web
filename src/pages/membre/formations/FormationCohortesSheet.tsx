import { Loader2 } from 'lucide-react'
import {
  Badge,
  Button,
  EmptyState,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Skeleton,
} from '@/components/ui'
import { useCohortes, useInscriptionCohorte } from '@/lib/queries'
import { formatDate } from '@/lib/utils/format'
import { statutCohorteMeta } from '@/lib/utils/status'
import type { Formation } from '@/lib/api/types'

interface FormationCohortesSheetProps {
  formation: Formation | null
  onOpenChange: (open: boolean) => void
}

export function FormationCohortesSheet({ formation, onOpenChange }: FormationCohortesSheetProps) {
  const { data: cohortes, isLoading } = useCohortes(formation?.id_formation ?? null)
  const inscription = useInscriptionCohorte()

  return (
    <Sheet open={formation !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{formation?.titre}</SheetTitle>
          <SheetDescription>Cohortes disponibles pour cette formation.</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          )}

          {!isLoading && (!cohortes || cohortes.length === 0) && (
            <EmptyState title="Aucune cohorte planifiée" description="Revenez plus tard pour cette formation." />
          )}

          {cohortes?.map((cohorte) => {
            const placesRestantes =
              cohorte.capacite_max !== null ? cohorte.capacite_max - cohorte.nombre_inscrits : null
            const complet = placesRestantes !== null && placesRestantes <= 0
            const dateLimiteDepassee =
              !!cohorte.date_limite_inscription && new Date(cohorte.date_limite_inscription) < new Date()
            const meta = statutCohorteMeta(cohorte.statut)

            return (
              <div key={cohorte.id_cohorte} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-foreground">{cohorte.code_cohorte}</p>
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </div>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p>
                    Du {formatDate(cohorte.date_debut)} au {formatDate(cohorte.date_fin)}
                  </p>
                  <p>{cohorte.lieu}</p>
                  {cohorte.formateur && <p>Formateur : {cohorte.formateur}</p>}
                  <p>
                    Places restantes : {placesRestantes !== null ? Math.max(placesRestantes, 0) : 'Illimité'}
                  </p>
                  {cohorte.prix && <p>Prix : {cohorte.prix}</p>}
                  {cohorte.date_limite_inscription && (
                    <p>Inscription jusqu'au {formatDate(cohorte.date_limite_inscription)}</p>
                  )}
                </div>
                <Separator className="my-3" />
                <Button
                  size="sm"
                  className="w-full"
                  disabled={complet || dateLimiteDepassee || inscription.isPending}
                  onClick={() => inscription.mutate(cohorte.id_cohorte)}
                >
                  {inscription.isPending && <Loader2 className="size-4 animate-spin" />}
                  {complet ? 'Complet' : dateLimiteDepassee ? 'Inscriptions closes' : "S'inscrire"}
                </Button>
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
