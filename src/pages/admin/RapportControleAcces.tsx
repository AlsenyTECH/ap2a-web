import { useState } from 'react'
import { Download, FileSpreadsheet, ShieldCheck } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  EmptyState,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { useControleurs, useRapportControleAcces } from '@/lib/queries'
import { toast } from 'sonner'
import { dashboardApi } from '@/lib/api/dashboard'
import { apiErrorMessage } from '@/lib/api/client'
import { formatDateTime } from '@/lib/utils/format'
import type { ScanControleAcces } from '@/lib/api/types'

interface Filtres {
  id_controleur: string
  date_debut: string
  date_fin: string
}

const FILTRES_VIDES: Filtres = { id_controleur: '', date_debut: '', date_fin: '' }

const typeLabel: Record<ScanControleAcces['type'], string> = {
  evenement: 'Événement',
  formation: 'Formation',
}

export default function RapportControleAcces() {
  const [form, setForm] = useState<Filtres>(FILTRES_VIDES)
  const [appliedFiltres, setAppliedFiltres] = useState<Filtres>(FILTRES_VIDES)

  const { data: controleurs } = useControleurs()
  const { data: scans, isLoading } = useRapportControleAcces({
    id_controleur: appliedFiltres.id_controleur ? Number(appliedFiltres.id_controleur) : undefined,
    date_debut: appliedFiltres.date_debut || undefined,
    date_fin: appliedFiltres.date_fin || undefined,
  })

  function handleFiltrer() {
    setAppliedFiltres(form)
  }

  function exporter(format: 'excel' | 'pdf') {
    dashboardApi.exporterRapport({
      type: 'controle_acces',
      format,
      id_controleur: appliedFiltres.id_controleur || undefined,
      date_debut: appliedFiltres.date_debut || undefined,
      date_fin: appliedFiltres.date_fin || undefined,
    }).catch((error) => toast.error(apiErrorMessage(error, "Impossible de lancer l'export")))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Rapport de contrôle d'accès</h1>
        <p className="text-sm text-muted-foreground">
          Historique des scans d'entrée (événements et formations), filtrable par contrôleur et par période.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label>Contrôleur</Label>
              <Select
                value={form.id_controleur || 'tous'}
                onValueChange={(v) => setForm((f) => ({ ...f, id_controleur: v === 'tous' ? '' : v }))}
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Tous les contrôleurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les contrôleurs</SelectItem>
                  {controleurs?.map((c) => (
                    <SelectItem key={c.id_controleur} value={String(c.id_controleur)}>
                      {c.prenom} {c.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date_debut">Du</Label>
              <Input
                id="date_debut"
                type="date"
                value={form.date_debut}
                onChange={(e) => setForm((f) => ({ ...f, date_debut: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date_fin">Au</Label>
              <Input
                id="date_fin"
                type="date"
                value={form.date_fin}
                onChange={(e) => setForm((f) => ({ ...f, date_fin: e.target.value }))}
              />
            </div>
            <Button onClick={handleFiltrer}>Filtrer</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => exporter('excel')}>
              <FileSpreadsheet />
              Exporter (Excel)
            </Button>
            <Button variant="outline" onClick={() => exporter('pdf')}>
              <Download />
              Exporter (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !scans || scans.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Aucun scan trouvé"
          description="Aucune entrée ne correspond aux filtres sélectionnés."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Personne</TableHead>
              <TableHead>Contexte</TableHead>
              <TableHead>Contrôleur</TableHead>
              <TableHead>Méthode</TableHead>
              <TableHead>Heure</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scans.map((scan, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Badge variant={scan.type === 'evenement' ? 'default' : 'secondary'}>
                    {typeLabel[scan.type]}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-foreground">{scan.personne}</TableCell>
                <TableCell>{scan.contexte}</TableCell>
                <TableCell>{scan.controleur}</TableCell>
                <TableCell>
                  <Badge variant="outline">{scan.methode_scan}</Badge>
                </TableCell>
                <TableCell>{formatDateTime(scan.heure_arrivee)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
