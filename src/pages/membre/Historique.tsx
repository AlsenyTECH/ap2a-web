import { History } from 'lucide-react'
import {
  Badge,
  EmptyState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { useHistoriqueParticipation } from '@/lib/queries'
import { formatDate, formatTime } from '@/lib/utils/format'

export default function Historique() {
  const { data: historique, isLoading } = useHistoriqueParticipation()

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-lg" />
  }

  if (!historique || historique.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Aucune participation enregistrée"
        description="Aucune participation enregistrée pour le moment."
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Événement</TableHead>
          <TableHead>Lieu</TableHead>
          <TableHead>Séance</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Heure d'arrivée</TableHead>
          <TableHead>Méthode</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {historique.map((h, index) => (
          <TableRow key={`${h.titre}-${h.numero_seance}-${h.date_seance}-${index}`}>
            <TableCell className="font-medium">{h.titre}</TableCell>
            <TableCell>{h.lieu}</TableCell>
            <TableCell>{h.numero_seance}</TableCell>
            <TableCell className="whitespace-nowrap">{formatDate(h.date_seance)}</TableCell>
            <TableCell>{formatTime(h.heure_arrivee)}</TableCell>
            <TableCell>
              <Badge variant="outline">{h.methode_scan}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
