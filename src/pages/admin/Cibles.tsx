import { useEffect, useState } from 'react'
import { FileSpreadsheet, Plus, Search, Target } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  EmptyState,
  Input,
  Pagination,
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
import { useCibles } from '@/lib/queries'
import { typeCibleLabel } from '@/lib/utils/status'
import type { TypeCible } from '@/lib/api/types'
import { ZoneSelect } from './referentiels/ZoneSelect'
import { CibleDialog } from './cibles/CibleDialog'
import { CibleFicheSheet } from './cibles/CibleFicheSheet'
import { ImportCiblesDialog } from './cibles/ImportCiblesDialog'

/** Les bénéficiaires de l'association : personnes, groupes, ASC, établissements, organisations, zones. */
export default function Cibles() {
  const [type, setType] = useState<TypeCible | 'TOUS'>('TOUS')
  const [saisie, setSaisie] = useState('')
  const [q, setQ] = useState('')
  const [zone, setZone] = useState<{ id: number; chemin: string } | null>(null)
  const [page, setPage] = useState(1)
  const [creation, setCreation] = useState(false)
  const [importOuvert, setImportOuvert] = useState(false)
  const [idFiche, setIdFiche] = useState<number | null>(null)

  // Recherche lancée après une courte pause de frappe.
  useEffect(() => {
    const minuteur = setTimeout(() => {
      setQ(saisie.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(minuteur)
  }, [saisie])

  const cibles = useCibles({ type: type === 'TOUS' ? undefined : type, q, zone: zone?.id, page })
  const donnees = cibles.data

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground">Cibles & Bénéficiaires</h1>
          <p className="text-sm text-muted-foreground">
            Personnes, groupes, ASC, établissements, organisations et zones qui bénéficient des actions de l'association.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOuvert(true)}>
            <FileSpreadsheet className="size-4" />
            Importer
          </Button>
          <Button onClick={() => setCreation(true)}>
            <Plus className="size-4" />
            Nouvelle cible
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[12rem_1fr_1fr]">
        <Select
          value={type}
          onValueChange={(v) => {
            setType(v as TypeCible | 'TOUS')
            setPage(1)
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TOUS">Tous les types</SelectItem>
            {Object.entries(typeCibleLabel).map(([code, libelle]) => (
              <SelectItem key={code} value={code}>
                {libelle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Nom, téléphone, pièce d'identité…"
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
          />
        </div>
        <ZoneSelect
          placeholder="Filtrer par zone…"
          valeurLibelle={zone?.chemin ?? null}
          onChange={(id, chemin) => {
            setZone(id && chemin ? { id, chemin } : null)
            setPage(1)
          }}
        />
      </div>

      {cibles.isLoading && <Skeleton className="h-64 w-full" />}
      {donnees && donnees.total === 0 && (
        <EmptyState
          icon={Target}
          title="Aucune cible"
          description={q || zone || type !== 'TOUS' ? 'Aucune cible ne correspond à ces filtres.' : 'Enregistrez une cible ou importez un fichier Excel.'}
        />
      )}
      {donnees && donnees.total > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Zone</TableHead>
                    <TableHead className="hidden sm:table-cell">Téléphone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donnees.resultats.map((c) => (
                    <TableRow key={c.id_cible} className="cursor-pointer" onClick={() => setIdFiche(c.id_cible)}>
                      <TableCell>
                        <p className={c.actif ? 'font-medium' : 'text-muted-foreground line-through'}>{c.nom_complet}</p>
                        {c.sous_type && <p className="text-xs text-muted-foreground">{c.sous_type}</p>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{typeCibleLabel[c.type_cible]}</Badge>
                      </TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground md:table-cell">{c.zone_chemin ?? '—'}</TableCell>
                      <TableCell className="hidden text-xs sm:table-cell">{c.telephone || '—'}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">{c.nombre_actions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      {donnees && donnees.pages > 1 && (
        <Pagination page={donnees.page} totalPages={donnees.pages} onPageChange={setPage} />
      )}
      {donnees && <p className="text-xs text-muted-foreground">{donnees.total} cible(s)</p>}

      <CibleDialog
        open={creation}
        onOpenChange={setCreation}
        onEnregistree={setIdFiche}
        onOuvrirExistante={setIdFiche}
      />
      <ImportCiblesDialog open={importOuvert} onOpenChange={setImportOuvert} />
      <CibleFicheSheet idCible={idFiche} onOpenChange={() => setIdFiche(null)} onOuvrir={setIdFiche} />
    </div>
  )
}
