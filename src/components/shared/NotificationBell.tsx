import { Bell, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui'
import { useMarquerNotificationLue, useNotifications, useToutMarquerLu } from '@/lib/queries'
import { formatRelative } from '@/lib/utils/format'
import { typeNotificationMeta } from '@/lib/utils/status'
import { cn } from '@/lib/utils'

export function NotificationBell({ notificationsHref }: { notificationsHref: string }) {
  const { data } = useNotifications(undefined, { refetchInterval: 60_000 })
  const marquerLue = useMarquerNotificationLue()
  const toutMarquerLu = useToutMarquerLu()

  const nbNonLues = data?.nb_non_lues ?? 0
  const recentes = data?.notifications.slice(0, 6) ?? []

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {nbNonLues > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {nbNonLues > 9 ? '9+' : nbNonLues}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {nbNonLues > 0 && (
            <button
              onClick={() => toutMarquerLu.mutate()}
              className="flex items-center gap-1 text-xs font-normal text-primary hover:underline"
            >
              <Check className="size-3" /> Tout marquer lu
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {recentes.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">Aucune notification</p>
        )}
        {recentes.map((n) => {
          const meta = typeNotificationMeta(n.type)
          return (
            <DropdownMenuItem
              key={n.id_notification}
              className={cn('flex flex-col items-start gap-0.5 whitespace-normal py-2', !n.lu && 'bg-accent/50')}
              onClick={() => !n.lu && marquerLue.mutate(n.id_notification)}
            >
              <div className="flex w-full items-center gap-2">
                <span
                  className={cn(
                    'size-1.5 shrink-0 rounded-full',
                    meta.variant === 'destructive' && 'bg-destructive',
                    meta.variant === 'warning' && 'bg-warning',
                    meta.variant === 'success' && 'bg-success',
                    meta.variant === 'default' && 'bg-primary',
                  )}
                />
                <span className="text-sm font-medium">{n.titre}</span>
              </div>
              <p className="line-clamp-2 pl-3.5 text-xs text-muted-foreground">{n.corps}</p>
              <span className="pl-3.5 text-[11px] text-muted-foreground">{formatRelative(n.date_creation)}</span>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <Link
          to={notificationsHref}
          className="block px-2 py-1.5 text-center text-sm text-primary hover:underline"
        >
          Voir toutes les notifications
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
