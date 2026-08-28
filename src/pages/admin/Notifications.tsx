import { Link } from 'react-router-dom'
import { AlertTriangle, Bell, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button, EmptyState, Skeleton } from '@/components/ui'
import { useMarquerNotificationLue, useNotifications, useToutMarquerLu } from '@/lib/queries'
import { formatRelative } from '@/lib/utils/format'
import { typeNotificationMeta } from '@/lib/utils/status'
import type { NotificationItem, TypeNotification } from '@/lib/api/types'

const TYPE_ICONS: Record<TypeNotification, typeof Info> = {
  INFO: Info,
  RAPPEL: Bell,
  ALERTE: AlertTriangle,
  SUCCES: CheckCircle2,
}

const TYPE_ICON_CLASS: Record<TypeNotification, string> = {
  INFO: 'bg-primary/10 text-primary',
  RAPPEL: 'bg-warning/15 text-warning',
  ALERTE: 'bg-destructive/15 text-destructive',
  SUCCES: 'bg-success/15 text-success',
}

export default function Notifications() {
  const { data, isLoading } = useNotifications()
  const marquerLue = useMarquerNotificationLue()
  const toutMarquerLu = useToutMarquerLu()

  const notifications = data?.notifications ?? []
  const nbNonLues = data?.nb_non_lues ?? 0

  function handleClick(notification: NotificationItem) {
    if (!notification.lu) marquerLue.mutate(notification.id_notification)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {nbNonLues > 0 ? `${nbNonLues} non lue${nbNonLues > 1 ? 's' : ''}` : 'Tout est lu'}
          </p>
        </div>
        {nbNonLues > 0 && (
          <Button variant="outline" size="sm" onClick={() => toutMarquerLu.mutate()} disabled={toutMarquerLu.isPending}>
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="Aucune notification" description="Vous n'avez aucune notification pour le moment." />
      ) : (
        <div className="max-w-2xl space-y-2">
          {notifications.map((notification) => {
            const meta = typeNotificationMeta(notification.type)
            const Icon = TYPE_ICONS[notification.type]
            const content = (
              <div
                className={cn(
                  'flex gap-3 rounded-lg border border-border p-4 transition-colors duration-150',
                  !notification.lu && 'bg-primary/5',
                  notification.lien_action && 'cursor-pointer hover:bg-accent',
                )}
                onClick={() => handleClick(notification)}
              >
                <div
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full',
                    TYPE_ICON_CLASS[notification.type],
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn('text-sm text-foreground', !notification.lu && 'font-semibold')}>
                      {notification.titre}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">{meta.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.corps}</p>
                  <p className="text-xs text-muted-foreground">{formatRelative(notification.date_creation)}</p>
                </div>
              </div>
            )

            if (!notification.lien_action) {
              return <div key={notification.id_notification}>{content}</div>
            }

            if (notification.lien_action.startsWith('/')) {
              return (
                <Link key={notification.id_notification} to={notification.lien_action} className="block">
                  {content}
                </Link>
              )
            }

            return (
              <a
                key={notification.id_notification}
                href={notification.lien_action}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                {content}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
