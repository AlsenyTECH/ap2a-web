import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth/AuthContext'
import type { CurrentUser, PermissionCode } from '@/lib/api/types'

function FullscreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
    </div>
  )
}

/**
 * Portail "naturel" d'un compte selon son rôle - utilisé pour rediriger
 * proprement les accès refusés, sans jamais faire ping-pong entre deux
 * guards (ex: un contrôleur pur qui atterrit sur /admin ne doit pas
 * repartir vers /membre où il n'a pas non plus accès).
 */
export function roleHome(user: CurrentUser | null): string {
  if (!user) return '/login'
  if (user.est_admin) return '/admin'
  if (user.est_membre) return '/membre'
  if (user.est_controleur) return '/controleur'
  return '/login'
}

/**
 * Protège les routes du portail admin. Accessible aux comptes admin
 * (et super admin). `permission`, si fournie, restreint en plus l'accès
 * aux admins qui possèdent ce code (le super admin passe toujours).
 */
export function AdminRoute({
  children,
  permission,
}: {
  children: ReactNode
  permission?: PermissionCode
}) {
  const { user, loading, hasPermission } = useAuth()
  const location = useLocation()

  if (loading) return <FullscreenLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (!user.est_admin) return <Navigate to={roleHome(user)} replace />
  if (permission && !hasPermission(permission)) return <Navigate to="/admin" replace />

  return <>{children}</>
}

/** Réservé au super admin (nommer/destituer des admins, gérer la config). */
export function SuperAdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullscreenLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (!user.est_super_admin) return <Navigate to={roleHome(user)} replace />

  return <>{children}</>
}

/** Protège les routes de l'espace membre. */
export function MemberRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullscreenLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (!user.est_membre) return <Navigate to={roleHome(user)} replace />

  return <>{children}</>
}

/** Protège les routes du portail contrôleur. */
export function ControleurRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullscreenLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (!user.est_controleur) return <Navigate to={roleHome(user)} replace />

  return <>{children}</>
}

export { FullscreenLoader }
