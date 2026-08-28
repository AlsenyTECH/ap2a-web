import { type ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { ScanLine, History, LogOut, BookUser, Landmark } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { cn } from '@/lib/utils'
import { initials } from '@/lib/utils/format'
import { Avatar, AvatarFallback, Button, Badge } from '@/components/ui'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

const NAV_ITEMS = [
  { to: '/controleur', label: 'Scanner QR / NFC', icon: ScanLine },
  { to: '/controleur/historique', label: 'Mon historique', icon: History },
  { to: '/controleur/annuaire', label: 'Annuaire', icon: BookUser },
  { to: '/controleur/gouvernance', label: 'Gouvernance', icon: Landmark },
]

export function ControleurLayout({ children }: { children?: ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary selection:text-primary-foreground transition-colors duration-200">
      <header className="sticky top-3 z-40 mx-auto w-[94%] max-w-2xl">
        <div className="rounded-2xl border border-border bg-[var(--header-bg)] backdrop-blur-xl shadow-xl px-4 py-2.5 flex items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3">
            <img
              src="/logo_AP2A.jpeg"
              alt="Logo AP2A"
              className="size-8 rounded-lg object-cover bg-white shadow-sm border border-border"
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-foreground">
                {user?.prenom} {user?.nom}
              </p>
              <Badge variant="outline" className="h-4 px-1.5 text-[9px] border-primary/40 text-primary font-semibold">
                Contrôleur d'Accès
              </Badge>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/controleur'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150',
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

          <div className="flex items-center gap-2">
            <ThemeToggle />
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
      <main className="mx-auto w-full max-w-2xl p-4 sm:p-6 mt-2">{children ?? <Outlet />}</main>
    </div>
  )
}
