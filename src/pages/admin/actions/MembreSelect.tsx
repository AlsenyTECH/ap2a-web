import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useMembres } from '@/lib/queries'

interface MembreSelectProps {
  libelle: string | null
  onChange: (idMembre: number | null, nom: string | null) => void
  placeholder?: string
}

/** Choix d'un seul membre par recherche (nom, prénom, numéro d'adhérent). */
export function MembreSelect({ libelle, onChange, placeholder = 'Rechercher un membre…' }: MembreSelectProps) {
  const [q, setQ] = useState('')
  const actif = q.trim().length >= 2
  const membres = useMembres({ q: q.trim() }, actif)

  if (libelle) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
        <span>{libelle}</span>
        <Button type="button" variant="ghost" size="icon" className="size-6" aria-label="Retirer" onClick={() => onChange(null, null)}>
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
      {actif && (
        <div className="max-h-48 overflow-y-auto rounded-md border">
          {membres.data?.length === 0 && <p className="p-2 text-xs text-muted-foreground">Aucun membre trouvé.</p>}
          {membres.data?.slice(0, 20).map((m) => (
            <button
              key={m.id_membre}
              type="button"
              className="flex w-full justify-between gap-2 px-3 py-1.5 text-left text-sm hover:bg-muted/50"
              onClick={() => {
                onChange(m.id_membre, `${m.prenom} ${m.nom}`)
                setQ('')
              }}
            >
              <span>
                {m.prenom} {m.nom}
              </span>
              <span className="text-xs text-muted-foreground">{m.numero_adherent}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
