import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui'

interface MasterDetailLayoutProps<T> {
  items: T[]
  getId: (item: T) => string | number
  selectedId: string | number | null
  onSelect: (item: T) => void
  renderItem: (item: T, selected: boolean) => ReactNode
  listHeader?: ReactNode
  listLoading?: boolean
  emptyList?: ReactNode
  detail: ReactNode
  /**
   * 'side-by-side' (défaut) : liste étroite à gauche, détail à droite.
   * 'stacked' : liste en rangée de cartes pleine largeur, détail en dessous
   * — utilisé par Formations/Cohortes pour éviter que la liste des cohortes
   * ne soit reléguée dans une colonne étroite à côté d'un panneau de détail
   * bien plus riche (onglets Vue d'ensemble/Séances/Participants).
   */
  orientation?: 'side-by-side' | 'stacked'
}

/**
 * Layout maître-détail générique : liste sélectionnable + panneau de détail.
 * Réutilisé par Événements, Formations/Cohortes et Actions Sociales — le
 * seul pattern d'écran qui revient à l'identique 3 fois.
 */
export function MasterDetailLayout<T>({
  items,
  getId,
  selectedId,
  onSelect,
  renderItem,
  listHeader,
  listLoading,
  emptyList,
  detail,
  orientation = 'side-by-side',
}: MasterDetailLayoutProps<T>) {
  if (orientation === 'stacked') {
    return (
      <div className="space-y-4">
        <div className="no-print space-y-4">
          {listHeader}
          {listLoading && (
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-72" />
              ))}
            </div>
          )}
          {!listLoading && items.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              {emptyList ?? <p className="text-sm text-muted-foreground">Aucun résultat</p>}
            </div>
          )}
          {!listLoading && items.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {items.map((item) => {
                const id = getId(item)
                const selected = id === selectedId
                return (
                  <button
                    key={id}
                    onClick={() => onSelect(item)}
                    className={cn(
                      'w-72 rounded-lg border p-3 text-left transition-colors',
                      selected ? 'border-primary bg-accent' : 'border-border bg-card hover:bg-muted',
                    )}
                  >
                    {renderItem(item, selected)}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <div className="min-w-0">{detail}</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr] lg:items-start">
      <div className="rounded-lg border border-border bg-card">
        {listHeader && <div className="border-b border-border p-3">{listHeader}</div>}
        <div className="max-h-[70vh] overflow-y-auto p-2">
          {listLoading &&
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="mb-2 h-16 w-full" />)}
          {!listLoading && items.length === 0 && (
            <div className="p-4">{emptyList ?? <p className="text-sm text-muted-foreground">Aucun résultat</p>}</div>
          )}
          {!listLoading &&
            items.map((item) => {
              const id = getId(item)
              const selected = id === selectedId
              return (
                <button
                  key={id}
                  onClick={() => onSelect(item)}
                  className={cn(
                    'mb-1 w-full rounded-md p-3 text-left transition-colors',
                    selected ? 'bg-accent' : 'hover:bg-muted',
                  )}
                >
                  {renderItem(item, selected)}
                </button>
              )
            })}
        </div>
      </div>
      <div className="min-w-0">{detail}</div>
    </div>
  )
}
