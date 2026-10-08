import { useState } from 'react'
import { Search } from 'lucide-react'
import { Badge, Input } from '@/components/ui'
import { useCibles } from '@/lib/queries'
import { typeCibleLabel } from '@/lib/utils/status'
import type { Cible, TypeCible } from '@/lib/api/types'

interface CibleRechercheProps {
  /** Types proposés (tous si absent). */
  types?: TypeCible[]
  exclure?: number[]
  onChoisir: (cible: Cible) => void
  placeholder?: string
}

/** Recherche d'une cible existante par nom, téléphone, pièce… (2 caractères minimum). */
export function CibleRecherche({ types, exclure = [], onChoisir, placeholder = 'Rechercher une cible…' }: CibleRechercheProps) {
  const [q, setQ] = useState('')
  const actif = q.trim().length >= 2
  // Un seul type : filtré côté serveur ; plusieurs : filtrés ici.
  const resultats = useCibles({ q: q.trim(), type: types?.length === 1 ? types[0] : undefined }, actif)
  const cibles = (resultats.data?.resultats ?? []).filter(
    (c) => !exclure.includes(c.id_cible) && (!types || types.includes(c.type_cible)),
  )

  return (
    <div className="space-y-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" value={q} placeholder={placeholder} onChange={(e) => setQ(e.target.value)} />
      </div>
      {actif && (
        <div className="max-h-56 overflow-y-auto rounded-md border">
          {!resultats.isFetching && cibles.length === 0 && (
            <p className="p-2 text-xs text-muted-foreground">Aucune cible trouvée.</p>
          )}
          {cibles.map((c) => (
            <button
              key={c.id_cible}
              type="button"
              className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm hover:bg-muted/50"
              onClick={() => {
                onChoisir(c)
                setQ('')
              }}
            >
              <span className="min-w-0">
                <span className="block truncate">{c.nom_complet}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {[c.telephone, c.zone_chemin].filter(Boolean).join(' · ')}
                </span>
              </span>
              <Badge variant="outline">{typeCibleLabel[c.type_cible]}</Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
