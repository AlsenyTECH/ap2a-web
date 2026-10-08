import { type ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { IdCard, User, GraduationCap, CalendarDays, History, Bell, LogOut, BookUser, Landmark, HandHeart } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { cn } from '@/lib/utils'
import { initials } from '@/lib/utils/format'
import { Avatar, AvatarFallback, Button } from '@/components/ui'
import { NotificationBell } from '@/components/shared/NotificationBell'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

const NAV_ITEMS = [
  { to: '/membre', label: 'Ma carte', icon: IdCard },
  { to: '/membre/profil', label: 'Mon profil', icon: User },
  { to: '/membre/formations', label: 'Formations', icon: GraduationCap },
  { to: '/membre/evenements', label: 'Événements', icon: CalendarDays },
  { to: '/membre/actions', label: 'Actions & missions', icon: HandHeart },
  { to: '/membre/annuaire', label: 'Annuaire', icon: BookUser },
  { to: '/membre/gouvernance', label: 'Gouvernance', icon: Landmark },
  { to: '/membre/notifications', label: 'Notifications', icon: Bell },
  { to: '/membre/historique', label: 'Historique', icon: History },
]

export function MemberLayout({ children }: { children?: ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary selection:text-primary-foreground transition-colors duration-200">
      {/* Floating Capsule Header */}
      <header className="sticky top-3 z-40 mx-auto w-[94%] max-w-5xl">
        <div className="rounded-2xl border border-border bg-[var(--header-bg)] backdrop-blur-xl shadow-xl px-4 py-2.5 flex items-center justify-between gap-4 transition-colors">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src="/logo_AP2A.jpeg"
              alt="Logo AP2A"
              className="size-8 rounded-lg object-cover bg-white shadow-sm border border-border"
            />
            <div className="hidden sm:flex flex-col">
              <span className="font-heading text-sm font-extrabold tracking-tight text-foreground leading-tight">
                AP2A <span className="text-primary text-xs">MEMBRE</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Espace Adhérent</span>
            </div>
          </div>

          {/* Center Nav Capsule Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-1 px-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/membre'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )
                  }
                >
                  <Icon className="size-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <NotificationBell notificationsHref="/membre/notifications" />
            <Avatar className="size-8 ring-1 ring-primary/40">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {initials(user?.nom ?? '', user?.prenom ?? '')}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Déconnexion"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8 rounded-lg"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8 mt-2">
        {children ?? <Outlet />}
      </main>

      {/* Modern Footer */}
      <footer className="mt-auto border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Association AP2A. Espace Adhérent Sécurisé & Cartes d'Accès.</p>
      </footer>
    </div>
  )
}
