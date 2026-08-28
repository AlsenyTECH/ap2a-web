import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Badge, Input } from '@/components/ui'
import { useMembres } from '@/lib/queries'
import { cn } from '@/lib/utils'

interface MemberMultiSelectProps {
  selectedIds: number[]
  onChange: (ids: number[]) => void
}

/**
 * Sélecteur de membres multiple avec recherche - utilisé pour le
 * ciblage d'événements restreints et de cohortes à public spécifique.
 */
export function MemberMultiSelect({ selectedIds, onChange }: MemberMultiSelectProps) {
  const [q, setQ] = useState('')
  const { data: membres, isLoading } = useMembres({ q: q || undefined })

  function toggle(id: number) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id])
  }

  const selectedMembres = (membres ?? []).filter((m) => selectedIds.includes(m.id_membre))

  return (
    <div className="space-y-2">
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedMembres.map((m) => (
            <Badge key={m.id_membre} variant="secondary" className="gap-1 pr-1">
              {m.prenom} {m.nom}
              <button type="button" onClick={() => toggle(m.id_membre)} className="rounded-full hover:bg-muted-foreground/20">
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          {selectedIds.length > selectedMembres.length && (
            <Badge variant="outline">+{selectedIds.length - selectedMembres.length} sélectionné(s)</Badge>
          )}
        </div>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un membre par nom, prénom, n° adhérent…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="max-h-48 overflow-y-auto rounded-md border border-border">
        {isLoading ? (
          <p className="p-3 text-center text-sm text-muted-foreground">Chargement…</p>
        ) : !membres || membres.length === 0 ? (
          <p className="p-3 text-center text-sm text-muted-foreground">Aucun membre trouvé.</p>
        ) : (
          membres.map((m) => {
            const checked = selectedIds.includes(m.id_membre)
            return (
              <button
                key={m.id_membre}
                type="button"
                onClick={() => toggle(m.id_membre)}
                className={cn(
                  'flex w-full items-center justify-between border-b border-border px-3 py-2 text-left text-sm last:border-b-0 hover:bg-accent',
                  checked && 'bg-accent',
                )}
              >
                <span>
                  {m.prenom} {m.nom}
                  <span className="ml-2 text-xs text-muted-foreground">{m.numero_adherent}</span>
                </span>
                {checked && <span className="text-xs font-medium text-primary">Sélectionné</span>}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
