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
import { useMonHistoriqueControleur } from '@/lib/queries'
import { formatDateTime } from '@/lib/utils/format'

const METHODE_LABEL: Record<string, string> = {
  QR: 'QR',
  NFC: 'NFC',
  MANUEL: 'Manuel',
}

export default function Historique() {
  const { data: historique, isLoading } = useMonHistoriqueControleur()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Mon historique</h1>
        <p className="text-sm text-muted-foreground">
          Entrées enregistrées lors de vos contrôles d'accès.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !historique || historique.length === 0 ? (
        <EmptyState
          icon={History}
          title="Aucune entrée enregistrée"
          description="Les membres que vous avez contrôlés apparaîtront ici."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membre</TableHead>
              <TableHead>N° adhérent</TableHead>
              <TableHead>Événement</TableHead>
              <TableHead>Séance</TableHead>
              <TableHead>Heure d'arrivée</TableHead>
              <TableHead>Méthode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historique.map((entry, index) => (
              <TableRow key={`${entry.numero_adherent}-${entry.heure_arrivee}-${index}`}>
                <TableCell className="font-medium text-foreground">{entry.membre}</TableCell>
                <TableCell>{entry.numero_adherent}</TableCell>
                <TableCell>{entry.evenement}</TableCell>
                <TableCell>Séance {entry.numero_seance}</TableCell>
                <TableCell>{formatDateTime(entry.heure_arrivee)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{METHODE_LABEL[entry.methode_scan] ?? entry.methode_scan}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
