import {
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { PackageCheck, Package, Users2 } from 'lucide-react'
import { useBasculerDistribution, useDistributionKit } from '@/lib/queries'
import { formatDate } from '@/lib/utils/format'
import type { Kit } from '@/lib/api/types'

interface KitDistributionDialogProps {
  kit: Kit | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KitDistributionDialog({ kit, open, onOpenChange }: KitDistributionDialogProps) {
  const distribution = useDistributionKit(open ? (kit?.id_kit ?? null) : null)
  const basculerDistribution = useBasculerDistribution()

  const nbDistribues = distribution.data?.filter((d) => d.distribue).length ?? 0
  const total = distribution.data?.length ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck className="size-4 text-primary" />
            Distribution — {kit?.nom}
          </DialogTitle>
          <DialogDescription>
            Cochez au fur et à mesure les personnes qui ont réellement reçu ce kit
            {total > 0 ? ` (${nbDistribues}/${total} remis).` : '.'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          {distribution.isLoading && <Skeleton className="h-40 w-full" />}
          {!distribution.isLoading && (!distribution.data || distribution.data.length === 0) && (
            <EmptyState
              icon={Users2}
              title="Aucun destinataire"
              description="Personne n'est encore inscrit dans le périmètre ciblé par ce kit."
            />
          )}
          {!distribution.isLoading && distribution.data && distribution.data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Remise</TableHead>
                  <TableHead>Remis par / le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distribution.data.map((d) => (
                  <TableRow key={d.id_participant}>
                    <TableCell className="font-medium">{d.prenom} {d.nom}</TableCell>
                    <TableCell>
                      <button
                        type="button"
                        disabled={basculerDistribution.isPending}
                        onClick={() =>
                          kit && basculerDistribution.mutate({ idKit: kit.id_kit, idParticipant: d.id_participant })
                        }
                        className="disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Badge variant={d.distribue ? 'success' : 'outline'} className="cursor-pointer gap-1">
                          {d.distribue ? <PackageCheck className="size-3" /> : <Package className="size-3" />}
                          {d.distribue ? 'Remis' : 'Non remis'}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {d.distribue && d.remis_par ? d.remis_par : '—'}
                      {d.distribue && d.date_distribution && ` · ${formatDate(d.date_distribution)}`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
