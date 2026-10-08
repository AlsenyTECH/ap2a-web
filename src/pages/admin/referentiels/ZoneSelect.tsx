import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Badge, Button, Input } from '@/components/ui'
import { useRechercheZones } from '@/lib/queries'
import { niveauZoneLabel } from '@/lib/utils/status'

interface ZoneSelectProps {
  /** Chemin affiché de la zone choisie (ex. "Dakar > Pikine"), ou null. */
  valeurLibelle: string | null
  onChange: (idZone: number | null, chemin: string | null) => void
  placeholder?: string
}

/** Choix d'une zone par recherche (le découpage complet compte des centaines de communes). */
export function ZoneSelect({ valeurLibelle, onChange, placeholder = 'Rechercher une zone…' }: ZoneSelectProps) {
  const [q, setQ] = useState('')
  const resultats = useRechercheZones(q)

  if (valeurLibelle) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
        <span>{valeurLibelle}</span>
        <Button type="button" variant="ghost" size="icon" className="size-6" aria-label="Retirer la zone" onClick={() => onChange(null, null)}>
          <X className="size-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" value={q} placeholder={placeholder} onChange={(e) => setQ(e.target.value)} />
      </div>
      {q.trim().length >= 2 && (
        <div className="max-h-48 overflow-y-auto rounded-md border">
          {resultats.data?.length === 0 && <p className="p-2 text-xs text-muted-foreground">Aucune zone trouvée.</p>}
          {resultats.data?.map((zone) => (
            <button
              key={zone.id_zone}
              type="button"
              className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm hover:bg-muted/50"
              onClick={() => {
                onChange(zone.id_zone, zone.chemin)
                setQ('')
              }}
            >
              <span>{zone.chemin}</span>
              <Badge variant="outline">{niveauZoneLabel[zone.niveau]}</Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
