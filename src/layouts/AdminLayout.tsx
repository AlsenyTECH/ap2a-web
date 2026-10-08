import { type ReactNode, useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CalendarDays,
  GraduationCap,
  HeartHandshake,
  ClipboardList,
  ScrollText,
  ScanLine,
  UserCog,
  Settings,
  LogOut,
  Award,
  Package,
  Menu,
  X,
  ExternalLink,
  BookUser,
  Landmark,
  SlidersHorizontal,
  Target,
} from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { cn } from '@/lib/utils'
import { initials } from '@/lib/utils/format'
import { Avatar, AvatarFallback, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui'
import { NotificationBell } from '@/components/shared/NotificationBell'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import type { PermissionCode } from '@/lib/api/types'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  permission?: PermissionCode
  superAdminOnly?: boolean
  badge?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const TABLEAU_DE_BORD: NavItem = { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard }

// Regroupement thématique du menu - même structure que le drawer
// admin mobile (accueil_admin_ecran.dart, _MenuAdmin), à garder
// strictement synchronisée entre les deux plateformes.
const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Communauté',
    items: [
      { to: '/admin/annuaire', label: 'Annuaire', icon: BookUser },
      { to: '/admin/gouvernance', label: 'Gouvernance', icon: Landmark },
      { to: '/admin/membres', label: 'Membres & Cartes', icon: Users, permission: 'GERER_MEMBRES' },
    ],
  },
  {
    label: 'Événements & Actions sociales',
    items: [
      { to: '/admin/evenements', label: 'Événements & Assemblées', icon: CalendarDays, permission: 'GERER_EVENEMENTS' },
      { to: '/admin/actions-sociales', label: 'Actions Sociales & Dons', icon: HeartHandshake, permission: 'GERER_ACTIONS_SOCIALES' },
      { to: '/admin/cibles', label: 'Cibles & Bénéficiaires', icon: Target, permission: 'GERER_CIBLES' },
      { to: '/admin/referentiels', label: 'Référentiels & Partenaires', icon: SlidersHorizontal, permission: 'GERER_REFERENTIELS' },
    ],
  },
  {
    label: 'Formations & Certifications',
    items: [
      { to: '/admin/formations', label: 'Formations & Cohortes', icon: GraduationCap, permission: 'GERER_FORMATIONS' },
      { to: '/admin/certificats-kits', label: 'Certificats & Badges', icon: Award, permission: 'GERER_FORMATIONS', badge: 'PRO' },
      { to: '/admin/kits', label: 'Kits Pédagogiques', icon: Package, permission: 'GERER_FORMATIONS' },
      { to: '/admin/suivi', label: 'Suivi Post-Formation', icon: ClipboardList, permission: 'GERER_SUIVI' },
    ],
  },
  {
    label: "Contrôle d'accès",
    items: [
      { to: '/admin/controleurs', label: 'Contrôleurs & Scanners', icon: ShieldCheck, permission: 'GERER_CONTROLEURS' },
      { to: '/admin/controle-acces', label: "Point de Contrôle d'Accès", icon: ScanLine },
    ],
  },
  {
    label: 'Rapports & Sécurité',
    items: [
      { to: '/admin/journal', label: 'Journal & Audit Sécurité', icon: ScrollText, permission: 'VOIR_RAPPORTS' },
      { to: '/admin/rapport-controle-acces', label: 'Rapport de Fréquentation', icon: ScrollText, permission: 'VOIR_RAPPORTS' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/admin/admins', label: 'Gestion Administrateurs', icon: UserCog, superAdminOnly: true },
      { to: '/admin/parametres', label: 'Configuration Asso', icon: Settings, superAdminOnly: true },
    ],
  },
]

function SidebarLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.to === '/admin'}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-sidebar-active text-sidebar-active-foreground font-semibold shadow-sm'
            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        )
      }
    >
      <div className="flex items-center gap-3">
        <Icon className="size-4 shrink-0 transition-transform group-hover:scale-110" />
        <span>{item.label}</span>
      </div>

      {item.badge && (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-primary/20 text-primary border border-primary/30">
          {item.badge}
        </span>
      )}
    </NavLink>
  )
}

export function AdminLayout({ children }: { children?: ReactNode }) {
  const { user, logout, hasPermission } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  function estVisible(item: NavItem) {
    if (item.superAdminOnly) return user?.est_super_admin
    if (item.permission) return hasPermission(item.permission)
    return true
  }

  const groupesVisibles = NAV_GROUPS.map((groupe) => ({
    ...groupe,
    items: groupe.items.filter(estVisible),
  })).filter((groupe) => groupe.items.length > 0)

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Dynamic Themed Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground transition-transform duration-200 lg:translate-x-0 shadow-lg',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo_AP2A.jpeg"
              alt="Logo AP2A"
              className="size-9 rounded-lg object-cover bg-white shadow-md border border-border"
            />
            <div className="flex flex-col">
              <span className="font-heading text-base font-extrabold tracking-tight text-sidebar-foreground leading-tight flex items-center gap-1.5">
                AP2A <span className="text-primary text-xs">PORTAL</span>
              </span>
              <span className="text-[10px] text-sidebar-muted-foreground font-medium leading-none">
                Administration & Audit
              </span>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-md text-sidebar-muted-foreground hover:text-sidebar-foreground lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4 custom-scrollbar">
          <div>
            <SidebarLink item={TABLEAU_DE_BORD} onClick={() => setMobileOpen(false)} />
          </div>
          {groupesVisibles.map((groupe) => (
            <div key={groupe.label} className="space-y-1">
              <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-sidebar-muted-foreground/80">
                {groupe.label}
              </div>
              {groupe.items.map((item) => (
                <SidebarLink key={item.to} item={item} onClick={() => setMobileOpen(false)} />
              ))}
            </div>
          ))}
        </nav>

        {/* User profile footer */}
        <div className="border-t border-sidebar-border p-3 bg-sidebar">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-sidebar-accent transition-colors">
                <Avatar className="size-8 ring-1 ring-primary/40">
                  <AvatarFallback className="bg-primary font-bold text-primary-foreground text-xs">
                    {initials(user?.nom ?? '', user?.prenom ?? '')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-sidebar-foreground">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="truncate text-[11px] text-primary font-medium">
                    {user?.est_super_admin ? 'Super Administrateur' : 'Administrateur'}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56 bg-popover border-border text-popover-foreground">
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                <LogOut className="size-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64 min-w-0">
        {/* Sticky Themed Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-[var(--header-bg)] backdrop-blur-md px-4 sm:px-6 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-muted/70 border border-border text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-medium text-foreground">Système Sécurisé AP2A v2.4</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/membre"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-primary" />
              Espace Adhérent
            </Link>

            {user?.est_super_admin && (
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-warning/20 text-warning border border-warning/30">
                Super Admin
              </span>
            )}
            <ThemeToggle />
            <NotificationBell notificationsHref="/admin/notifications" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-background transition-colors">
          <div className="max-w-7xl mx-auto">{children ?? <Outlet />}</div>
        </main>
      </div>
    </div>
  )
}
