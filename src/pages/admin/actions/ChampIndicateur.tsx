import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@/components/ui'
import type { ActionFiche, ValeurIndicateurJson } from '@/lib/api/types'

type Indicateur = ActionFiche['indicateurs'][number]

interface ChampIndicateurProps {
  indicateur: Indicateur
  valeur: ValeurIndicateurJson | undefined
  onChange: (valeur: ValeurIndicateurJson) => void
  desactive?: boolean
}

const VIDE = '__vide__'

/** Champ de saisie adapté au type de l'indicateur (nombre, oui/non, choix, date, texte). */
export function ChampIndicateur({ indicateur, valeur, onChange, desactive }: ChampIndicateurProps) {
  const id = `ind-${indicateur.id_indicateur}`
  const libelle = (
    <label htmlFor={id} className="text-sm font-medium">
      {indicateur.libelle}
      {indicateur.unite && <span className="font-normal text-muted-foreground"> ({indicateur.unite})</span>}
      {indicateur.obligatoire && <span className="text-destructive"> *</span>}
    </label>
  )

  let champ
  switch (indicateur.type_valeur) {
    case 'BOOLEEN':
      champ = (
        <Select
          disabled={desactive}
          value={valeur === true ? 'oui' : valeur === false ? 'non' : VIDE}
          onValueChange={(v) => onChange(v === VIDE ? null : v === 'oui')}
        >
          <SelectTrigger id={id}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={VIDE}>—</SelectItem>
            <SelectItem value="oui">Oui</SelectItem>
            <SelectItem value="non">Non</SelectItem>
          </SelectContent>
        </Select>
      )
      break
    case 'CHOIX':
      champ = (
        <Select disabled={desactive} value={(valeur as string) || VIDE} onValueChange={(v) => onChange(v === VIDE ? null : v)}>
          <SelectTrigger id={id}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={VIDE}>—</SelectItem>
            {indicateur.choix.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
      break
    case 'DATE':
      champ = (
        <Input id={id} type="date" disabled={desactive} value={(valeur as string) ?? ''} onChange={(e) => onChange(e.target.value || null)} />
      )
      break
    case 'TEXTE':
      champ = (
        <Textarea id={id} rows={2} disabled={desactive} value={(valeur as string) ?? ''} onChange={(e) => onChange(e.target.value)} />
      )
      break
    default:
      champ = (
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={indicateur.type_valeur === 'DECIMAL' ? 'any' : 1}
          disabled={desactive}
          value={valeur === null || valeur === undefined ? '' : String(valeur)}
          onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
        />
      )
  }

  return (
    <div className="space-y-1.5">
      {libelle}
      {champ}
      {indicateur.description && <p className="text-xs text-muted-foreground">{indicateur.description}</p>}
    </div>
  )
}

/** Affichage lisible d'une valeur saisie. */
export function formaterValeur(indicateur: Indicateur, valeur: ValeurIndicateurJson | undefined): string {
  if (valeur === null || valeur === undefined || valeur === '') return '—'
  if (indicateur.type_valeur === 'BOOLEEN') return valeur ? 'Oui' : 'Non'
  if (typeof valeur === 'number') {
    return `${valeur.toLocaleString('fr-FR')}${indicateur.unite ? ` ${indicateur.unite}` : ''}`
  }
  return String(valeur)
}
