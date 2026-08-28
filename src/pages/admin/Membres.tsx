import { useEffect, useMemo, useState } from 'react'
import { Eye, Upload, UserPlus, Users } from 'lucide-react'
import {
  Badge,
  Button,
  EmptyState,
  Input,
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
import { ExcelImportModal } from '@/components/shared/ExcelImportModal'
import { MembreDetailSheet } from '@/pages/admin/membres/MembreDetailSheet'
import { CreateMembreAdminDialog } from '@/pages/admin/membres/CreateMembreAdminDialog'
import { useImporterMembres, useMembres, useSections } from '@/lib/queries'
import { fonctionAssociationLabel, statutAdhesionMeta, statutCarteMeta } from '@/lib/utils/status'
import type { FonctionAssociation, StatutCarte } from '@/lib/api/types'

const STATUT_CARTE_OPTIONS: { value: StatutCarte | 'TOUTES'; label: string }[] = [
  { value: 'TOUTES', label: 'Toutes' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'BLOQUEE', label: 'Bloquée' },
  { value: 'PERDUE', label: 'Perdue' },
]

interface ImportResult {
  message: string
  crees: number
  doublons: number
  erreurs: string[]
}

export default function Membres() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statutCarte, setStatutCarte] = useState<StatutCarte | 'TOUTES'>('TOUTES')
  const [idSection, setIdSection] = useState<string>('TOUTES')
  const [fonction, setFonction] = useState<string>('TOUTES')
  const [selectedMembreId, setSelectedMembreId] = useState<number | null>(null)
  const [createMembreOpen, setCreateMembreOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: sections } = useSections()

  const params = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      statut_carte: statutCarte === 'TOUTES' ? undefined : statutCarte,
      id_section: idSection === 'TOUTES' ? undefined : Number(idSection),
      fonction: fonction === 'TOUTES' ? undefined : (fonction as FonctionAssociation),
    }),
    [debouncedSearch, statutCarte, idSection, fonction],
  )

  const { data: membres, isLoading } = useMembres(params)
  const importerMembres = useImporterMembres()

  const hasFilters =
    debouncedSearch.length > 0 || statutCarte !== 'TOUTES' || idSection !== 'TOUTES' || fonction !== 'TOUTES'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Membres</h1>
          <p className="text-sm text-muted-foreground">Gestion des adhérents et de leurs cartes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="size-4 mr-1.5" />
            Importer Excel
          </Button>
          <Button onClick={() => setCreateMembreOpen(true)}>
            <UserPlus className="size-4 mr-1.5" />
            Nouveau membre
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Rechercher un membre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={statutCarte} onValueChange={(v) => setStatutCarte(v as StatutCarte | 'TOUTES')}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Statut carte" />
          </SelectTrigger>
          <SelectContent>
            {STATUT_CARTE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={fonction} onValueChange={setFonction}>
          <SelectTrigger className="sm:w-56">
            <SelectValue placeholder="Fonction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TOUTES">Toutes les fonctions</SelectItem>
            {Object.entries(fonctionAssociationLabel).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={idSection} onValueChange={setIdSection}>
          <SelectTrigger className="sm:w-56">
            <SelectValue placeholder="Section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TOUTES">Toutes les sections</SelectItem>
            {sections?.map((section) => (
              <SelectItem key={section.id_section} value={String(section.id_section)}>
                {section.nom_section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !membres || membres.length === 0 ? (
        <EmptyState
          icon={Users}
          title={hasFilters ? 'Aucun membre ne correspond aux filtres' : 'Aucun membre'}
          description={
            hasFilters
              ? 'Essayez de modifier ou réinitialiser les filtres.'
              : "Importez un fichier Excel pour ajouter des membres."
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom Prénom</TableHead>
              <TableHead>N° adhérent</TableHead>
              <TableHead>Fonction AP2A</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Statut adhésion</TableHead>
              <TableHead>Statut carte</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {membres.map((membre) => (
              <TableRow
                key={membre.id_membre}
                className="cursor-pointer"
                onClick={() => setSelectedMembreId(membre.id_membre)}
              >
                <TableCell className="font-medium text-foreground">
                  {membre.prenom} {membre.nom}
                </TableCell>
                <TableCell>{membre.numero_adherent}</TableCell>
                <TableCell>{membre.fonction_association_libelle}</TableCell>
                <TableCell>{membre.section ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={statutAdhesionMeta(membre.statut_adhesion).variant}>
                    {statutAdhesionMeta(membre.statut_adhesion).label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {membre.statut_carte ? (
                    <Badge variant={statutCarteMeta(membre.statut_carte).variant}>
                      {statutCarteMeta(membre.statut_carte).label}
                    </Badge>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedMembreId(membre.id_membre)
                    }}
                  >
                    <Eye />
                    <span className="sr-only">Voir le détail</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <MembreDetailSheet idMembre={selectedMembreId} onOpenChange={() => setSelectedMembreId(null)} />

      <CreateMembreAdminDialog open={createMembreOpen} onOpenChange={setCreateMembreOpen} />

      <ExcelImportModal<ImportResult>
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Importer des membres"
        instructions="Colonnes attendues : nom, prenom, email, telephone (optionnel), section_id (optionnel). Un mot de passe temporaire est généré pour chaque nouveau membre."
        onImport={(fichier) => importerMembres.mutateAsync(fichier)}
        renderResult={(result) => (
          <div className="space-y-2">
            <p>
              <span className="font-medium text-foreground">{result.crees}</span> membre(s) créé(s),{' '}
              <span className="font-medium text-foreground">{result.doublons}</span> doublon(s) ignoré(s).
            </p>
            {result.erreurs.length > 0 && (
              <div>
                <p className="font-medium text-destructive">Erreurs :</p>
                <ul className="list-inside list-disc text-destructive">
                  {result.erreurs.map((erreur, i) => (
                    <li key={i}>{erreur}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      />
    </div>
  )
}
