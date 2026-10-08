import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, ClipboardList, ListTodo, MapPin, Plus, Search, Target, Users } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  Checkbox,
  EmptyState,
  Input,
  Pagination,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { useActions, useBesoins, useTypesAction } from '@/lib/queries'
import { formatDate } from '@/lib/utils/format'
import { prioriteBesoinMeta, statutActionMeta, statutBesoinMeta, typeCibleLabel } from '@/lib/utils/status'
import type { Besoin, StatutAction } from '@/lib/api/types'
import { ActionDialog } from './actions/ActionDialog'

const FILTRES_STATUT: { valeur: string; libelle: string }[] = [
  { valeur: 'BROUILLON,PLANIFIEE,EN_COURS', libelle: 'En cours et à venir' },
  { valeur: 'TERMINEE', libelle: 'Terminées' },
  { valeur: 'ANNULEE', libelle: 'Annulées' },
  { valeur: '', libelle: 'Toutes' },
]

function ListeActions() {
  const types = useTypesAction()
  const [statut, setStatut] = useState(FILTRES_STATUT[0].valeur)
  const [type, setType] = useState('TOUS')
  const [saisie, setSaisie] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const minuteur = setTimeout(() => {
      setQ(saisie.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(minuteur)
  }, [saisie])

  const actions = useActions({ statut: statut || undefined, type: type === 'TOUS' ? undefined : Number(type), q, page })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[14rem_14rem_1fr]">
        <Select value={statut || 'TOUTES'} onValueChange={(v) => { setStatut(v === 'TOUTES' ? '' : v); setPage(1) }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTRES_STATUT.map((f) => (
              <SelectItem key={f.libelle} value={f.valeur || 'TOUTES'}>
                {f.libelle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={(v) => { setType(v); setPage(1) }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TOUS">Tous les types</SelectItem>
            {types.data?.map((t) => (
              <SelectItem key={t.id_type_action} value={String(t.id_type_action)}>
                {t.libelle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Titre, lieu…" value={saisie} onChange={(e) => setSaisie(e.target.value)} />
        </div>
      </div>

      {actions.isLoading && <Skeleton className="h-48 w-full" />}
      {actions.data?.total === 0 && (
        <EmptyState icon={ClipboardList} title="Aucune action" description="Créez une action, ou partez des besoins à couvrir." />
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {actions.data?.resultats.map((a) => {
          const meta = statutActionMeta(a.statut as StatutAction)
          return (
            <Link key={a.id_action} to={`/admin/actions/${a.id_action}`}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium leading-snug">{a.titre}</p>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.type_action_libelle}</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      {formatDate(a.date_debut)}
                      {a.date_fin && a.date_fin !== a.date_debut ? ` → ${formatDate(a.date_fin)}` : ''}
                    </p>
                    {(a.lieu || a.zone_chemin) && (
                      <p className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" />
                        {a.lieu || a.zone_chemin}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 pt-1 text-xs">
                    <span className="flex items-center gap-1">
                      <Target className="size-3.5" />
                      {a.nombre_cibles_servies}/{a.nombre_cibles} servies
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5" />
                      {a.nombre_equipe} membre(s)
                    </span>
                    <span className="flex items-center gap-1">
                      <ListTodo className="size-3.5" />
                      {a.taches_restantes} tâche(s)
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
      {actions.data && actions.data.pages > 1 && (
        <Pagination page={actions.data.page} totalPages={actions.data.pages} onPageChange={setPage} />
      )}
    </div>
  )
}

function BesoinsACouvrir({ onCreerAction }: { onCreerAction: (besoins: Besoin[]) => void }) {
  const besoins = useBesoins({ statut: 'IDENTIFIE' })
  const [selection, setSelection] = useState<number[]>([])
  const choisis = (besoins.data ?? []).filter((b) => selection.includes(b.id_besoin))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Besoins identifiés sur les fiches des cibles et qu'aucune action ne couvre encore. Cochez-en un ou plusieurs pour
          créer l'action qui y répond.
        </p>
        <Button disabled={choisis.length === 0} onClick={() => onCreerAction(choisis)}>
          <Plus className="size-4" />
          Créer une action ({choisis.length})
        </Button>
      </div>
      {besoins.isLoading && <Skeleton className="h-32 w-full" />}
      {besoins.data?.length === 0 && (
        <EmptyState icon={Target} title="Aucun besoin en attente" description="Ajoutez des besoins depuis la fiche d'une cible." />
      )}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {besoins.data?.map((b) => {
          const priorite = prioriteBesoinMeta(b.priorite)
          return (
            <label key={b.id_besoin} className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/40">
              <Checkbox
                className="mt-0.5"
                checked={selection.includes(b.id_besoin)}
                onCheckedChange={() =>
                  setSelection((s) => (s.includes(b.id_besoin) ? s.filter((x) => x !== b.id_besoin) : [...s, b.id_besoin]))
                }
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-medium">{b.description}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {b.cible} · {typeCibleLabel[b.type_cible]}
                  {b.zone_chemin ? ` · ${b.zone_chemin}` : ''}
                </p>
                {b.type_action_libelle && <p className="text-xs">→ {b.type_action_libelle}</p>}
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={priorite.variant}>{priorite.label}</Badge>
                <span className="text-[11px] text-muted-foreground">{statutBesoinMeta(b.statut).label}</span>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}

/** Toutes les actions de l'association, et les besoins des cibles qui attendent une action. */
export default function Actions() {
  const navigate = useNavigate()
  const [creation, setCreation] = useState<{ ouvert: boolean; besoins: Besoin[] }>({ ouvert: false, besoins: [] })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground">Actions</h1>
          <p className="text-sm text-muted-foreground">
            Organisez chaque action avant, pendant et après : cibles, équipe de membres, partenaires, tâches et bilan.
          </p>
        </div>
        <Button onClick={() => setCreation({ ouvert: true, besoins: [] })}>
          <Plus className="size-4" />
          Nouvelle action
        </Button>
      </div>
      <Tabs defaultValue="actions">
        <TabsList>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="besoins">Besoins à couvrir</TabsTrigger>
        </TabsList>
        <TabsContent value="actions" className="pt-4">
          <ListeActions />
        </TabsContent>
        <TabsContent value="besoins" className="pt-4">
          <BesoinsACouvrir onCreerAction={(besoins) => setCreation({ ouvert: true, besoins })} />
        </TabsContent>
      </Tabs>
      <ActionDialog
        open={creation.ouvert}
        besoins={creation.besoins}
        onOpenChange={(ouvert) => setCreation((c) => ({ ...c, ouvert }))}
        onCreee={(id) => navigate(`/admin/actions/${id}`)}
      />
    </div>
  )
}
