import { Link } from 'react-router-dom'
import {
  CalendarDays,
  GraduationCap,
  HeartHandshake,
  Package,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { useDashboardStats } from '@/lib/queries'
import { useAuth } from '@/lib/auth/AuthContext'
import { formatRelative } from '@/lib/utils/format'
import type { PermissionCode } from '@/lib/api/types'

const RACCOURCIS: Array<{ to: string; label: string; permission?: PermissionCode }> = [
  { to: '/admin/annuaire', label: 'Annuaire' },
  { to: '/admin/gouvernance', label: 'Gouvernance' },
  { to: '/admin/membres', label: 'Membres', permission: 'GERER_MEMBRES' },
  { to: '/admin/evenements', label: 'Événements', permission: 'GERER_EVENEMENTS' },
  { to: '/admin/formations', label: 'Formations', permission: 'GERER_FORMATIONS' },
  { to: '/admin/actions-sociales', label: 'Actions sociales', permission: 'GERER_ACTIONS_SOCIALES' },
]

export default function Dashboard() {
  const { data: stats, isLoading, refetch, isFetching } = useDashboardStats()
  const { hasPermission } = useAuth()

  const raccourcisVisibles = RACCOURCIS.filter((r) => !r.permission || hasPermission(r.permission))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble de l'activité de l'association.</p>
        </div>
        <div className="flex items-center gap-3">
          {stats && (
            <p className="text-xs text-muted-foreground">Mis à jour {formatRelative(stats.date_mise_a_jour)}</p>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={isFetching ? 'animate-spin' : undefined} />
            Actualiser
          </Button>
        </div>
      </div>

      {isLoading || !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Membres actifs</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">{stats.membres.actifs}</p>
              <p className="text-xs text-muted-foreground">+{stats.membres.nouveaux_7j} sur 7 jours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Événements à venir</CardTitle>
              <CalendarDays className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">{stats.evenements.a_venir}</p>
              <p className="text-xs text-muted-foreground">
                {stats.evenements.en_cours_aujourdhui} en cours aujourd'hui
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cohortes en cours</CardTitle>
              <GraduationCap className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">{stats.formations.cohortes_en_cours}</p>
              <p className="text-xs text-muted-foreground">
                {stats.formations.participants_actifs} participants actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Actions sociales en cours</CardTitle>
              <HeartHandshake className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">{stats.actions_sociales.en_cours}</p>
              <p className="text-xs text-muted-foreground">
                {stats.actions_sociales.beneficiaires_total} bénéficiaires au total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {stats && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <TrendingUp className="size-4 text-primary" />
            <CardTitle className="text-base">Registre d'impact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Bénéficiaires aidés (total)</p>
              <p className="text-xl font-semibold text-foreground">{stats.impact.beneficiaires_aides_total}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Formations terminées (total)</p>
              <p className="text-xl font-semibold text-foreground">{stats.impact.formations_terminees_total}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Package className="size-3.5" /> Kits distribués (total)
              </p>
              <p className="text-xl font-semibold text-foreground">{stats.impact.kits_distribues_total}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="size-3.5" /> Taux de réussite du suivi
              </p>
              <p className="text-xl font-semibold text-foreground">
                {stats.impact.taux_reussite_suivi !== null ? `${stats.impact.taux_reussite_suivi}%` : '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {stats && stats.repartition_par_fonction.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition par fonction AP2A</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {stats.repartition_par_fonction.map((ligne) => (
              <div key={ligne.fonction_association}>
                <p className="text-xs text-muted-foreground">{ligne.fonction_association_libelle}</p>
                <p className="text-lg font-semibold text-foreground">{ligne.nombre}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {raccourcisVisibles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Raccourcis</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {raccourcisVisibles.map((r) => (
              <Button key={r.to} variant="outline" asChild>
                <Link to={r.to}>{r.label}</Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
