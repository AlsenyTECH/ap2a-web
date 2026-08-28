import { useState } from 'react'
import { Download, FileSpreadsheet, ScrollText, Users } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Label,
  Separator,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Pagination,
} from '@/components/ui'
import { useJournal, useStatistiques } from '@/lib/queries'
import { dashboardApi } from '@/lib/api/dashboard'
import { formatDateTime } from '@/lib/utils/format'

interface Filtres {
  type_action: string
  date_debut: string
  date_fin: string
}

const FILTRES_VIDES: Filtres = { type_action: '', date_debut: '', date_fin: '' }

export default function Journal() {
  const [form, setForm] = useState<Filtres>(FILTRES_VIDES)
  const [appliedFiltres, setAppliedFiltres] = useState<Filtres>(FILTRES_VIDES)
  const [page, setPage] = useState(1)

  const { data: stats, isLoading: statsLoading } = useStatistiques()
  const { data: journal, isLoading: journalLoading } = useJournal({
    type_action: appliedFiltres.type_action || undefined,
    date_debut: appliedFiltres.date_debut || undefined,
    date_fin: appliedFiltres.date_fin || undefined,
    page,
  })

  function handleFiltrer() {
    setAppliedFiltres(form)
    setPage(1)
  }

  function exporter(type: 'journal' | 'statistiques', format: 'excel' | 'pdf') {
    const url = dashboardApi.exportRapportUrl({
      type,
      format,
      type_action: appliedFiltres.type_action || undefined,
      date_debut: appliedFiltres.date_debut || undefined,
      date_fin: appliedFiltres.date_fin || undefined,
    })
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Journal &amp; rapports</h1>
        <p className="text-sm text-muted-foreground">
          Historique des actions et export de rapports statistiques.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total membres</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-semibold text-foreground">{stats?.total_membres ?? 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Membres actifs</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-semibold text-foreground">{stats?.membres_actifs ?? 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Répartition par section</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : !stats || stats.repartition_par_section.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune donnée.</p>
            ) : (
              <ul className="space-y-1.5">
                {stats.repartition_par_section.map((item, i) => {
                  const max = Math.max(...stats.repartition_par_section.map((s) => s.nombre), 1)
                  return (
                    <li key={i} className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground">{item.section__nom_section ?? 'Sans section'}</span>
                        <span className="text-muted-foreground">{item.nombre}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(item.nombre / max) * 100}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exporter un rapport</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => exporter('journal', 'excel')}>
            <FileSpreadsheet />
            Exporter le journal (Excel)
          </Button>
          <Button variant="outline" onClick={() => exporter('journal', 'pdf')}>
            <Download />
            Exporter le journal (PDF)
          </Button>
          <Button variant="outline" onClick={() => exporter('statistiques', 'excel')}>
            <FileSpreadsheet />
            Exporter les statistiques (Excel)
          </Button>
          <Button variant="outline" onClick={() => exporter('statistiques', 'pdf')}>
            <Download />
            Exporter les statistiques (PDF)
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="type_action">Type d'action</Label>
            <Input
              id="type_action"
              placeholder="Ex : CREATION_MEMBRE"
              value={form.type_action}
              onChange={(e) => setForm((f) => ({ ...f, type_action: e.target.value }))}
              className="w-52"
            />
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

        {journalLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !journal || journal.resultats.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="Aucune entrée de journal"
            description="Aucune action ne correspond aux filtres sélectionnés."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type d'action</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Auteur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journal.resultats.map((entry, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-foreground">{entry.type_action}</TableCell>
                    <TableCell>{formatDateTime(entry.date_action)}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="flex items-center gap-1.5">
                      <Users className="size-3.5 text-muted-foreground" />
                      {entry.auteur}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={journal.page} totalPages={journal.nombre_pages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
