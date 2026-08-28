import { History } from 'lucide-react'
import {
  Badge,
  EmptyState,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Skeleton,
} from '@/components/ui'
import { useSuivisParticipant } from '@/lib/queries'
import { formatDate } from '@/lib/utils/format'
import { moyenContactLabel, statutGlobalSuiviMeta } from '@/lib/utils/status'

interface HistoriqueSuiviSheetProps {
  idParticipant: number | null
  onOpenChange: (open: boolean) => void
}

export function HistoriqueSuiviSheet({ idParticipant, onOpenChange }: HistoriqueSuiviSheetProps) {
  const open = idParticipant !== null
  const { data, isLoading } = useSuivisParticipant(idParticipant)

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onOpenChange(false)}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Historique de suivi</SheetTitle>
          <SheetDescription>
            {data?.participant ?? 'Toutes les fiches de suivi enregistrées pour ce participant.'}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : !data || data.suivis.length === 0 ? (
          <div className="mt-4">
            <EmptyState icon={History} title="Aucun suivi enregistré" description="Aucune fiche de suivi pour ce participant." />
          </div>
        ) : (
          <ol className="mt-4 space-y-4 border-l border-border pl-4">
            {data.suivis.map((suivi) => (
              <li key={suivi.id_suivi} className="relative">
                <span className="absolute -left-[21px] top-1 size-2.5 rounded-full border-2 border-background bg-primary" />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{formatDate(suivi.date_suivi)}</p>
                  <Badge variant={statutGlobalSuiviMeta(suivi.statut_global).variant}>
                    {statutGlobalSuiviMeta(suivi.statut_global).label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {moyenContactLabel[suivi.moyen_contact] ?? suivi.moyen_contact} · par {suivi.effectue_par}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {suivi.kit_remis && <Badge variant="outline">Kit remis</Badge>}
                  {suivi.certificat_emis && <Badge variant="outline">Certificat émis</Badge>}
                  {suivi.activite_lancee && (
                    <Badge variant="outline">Activité{suivi.type_activite ? ` · ${suivi.type_activite}` : ''}</Badge>
                  )}
                  {suivi.niveau_satisfaction !== null && (
                    <Badge variant="secondary">Satisfaction {suivi.niveau_satisfaction}/5</Badge>
                  )}
                </div>
                {suivi.difficultes && (
                  <p className="mt-1.5 text-sm text-foreground">
                    <span className="text-xs text-muted-foreground">Difficultés : </span>
                    {suivi.difficultes}
                  </p>
                )}
                {suivi.recommandations && (
                  <p className="mt-1 text-sm text-foreground">
                    <span className="text-xs text-muted-foreground">Recommandations : </span>
                    {suivi.recommandations}
                  </p>
                )}
                <Separator className="mt-3" />
              </li>
            ))}
          </ol>
        )}
      </SheetContent>
    </Sheet>
  )
}
