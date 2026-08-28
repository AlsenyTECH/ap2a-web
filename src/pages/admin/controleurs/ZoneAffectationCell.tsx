import { useState } from 'react'
import { Check, Loader2, Pencil, X } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useModifierControleur } from '@/lib/queries'

interface ZoneAffectationCellProps {
  idControleur: number
  zoneAffectation: string | null
}

export function ZoneAffectationCell({ idControleur, zoneAffectation }: ZoneAffectationCellProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(zoneAffectation ?? '')
  const modifierControleur = useModifierControleur()

  function handleSave() {
    modifierControleur.mutate(
      { id: idControleur, payload: { zone_affectation: value } },
      { onSuccess: () => setEditing(false) },
    )
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setValue(zoneAffectation ?? '')
          setEditing(true)
        }}
        className="group flex items-center gap-1.5 text-left text-sm"
      >
        <span className={zoneAffectation ? 'text-foreground' : 'text-muted-foreground'}>
          {zoneAffectation || 'Non définie'}
        </span>
        <Pencil className="size-3 text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') setEditing(false)
        }}
        className="h-8 w-40 text-sm"
        disabled={modifierControleur.isPending}
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-8"
        onClick={handleSave}
        disabled={modifierControleur.isPending}
      >
        {modifierControleur.isPending ? <Loader2 className="animate-spin" /> : <Check />}
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-8"
        onClick={() => setEditing(false)}
        disabled={modifierControleur.isPending}
      >
        <X />
      </Button>
    </div>
  )
}
