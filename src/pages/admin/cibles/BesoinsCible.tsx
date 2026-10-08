import { useState } from 'react'
import { ClipboardList, Plus, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { useAjouterBesoin, useModifierBesoin, useSupprimerBesoin, useTypesAction } from '@/lib/queries'
import { prioriteBesoinMeta, statutBesoinMeta } from '@/lib/utils/status'
import type { CibleFiche, PrioriteBesoin, TypeCible } from '@/lib/api/types'

const AUCUN = '__aucun__'

/** Besoins d'une cible : point de départ des actions de l'association. */
export function BesoinsCible({ cible }: { cible: CibleFiche }) {
  const types = useTypesAction()
  const ajouter = useAjouterBesoin()
  const modifier = useModifierBesoin()
  const supprimer = useSupprimerBesoin()
  const [description, setDescription] = useState('')
  const [priorite, setPriorite] = useState<PrioriteBesoin>('MOYENNE')
  const [typeAction, setTypeAction] = useState(AUCUN)
  const typesPossibles = (types.data ?? []).filter((t) => t.actif && t.types_cible.includes(cible.type_cible as TypeCible))

  function soumettre() {
    if (!description.trim()) return
    ajouter.mutate(
      {
        idCible: cible.id_cible,
        payload: { description: description.trim(), priorite, type_action: typeAction === AUCUN ? null : Number(typeAction) },
      },
      { onSuccess: () => { setDescription(''); setTypeAction(AUCUN); setPriorite('MOYENNE') } },
    )
  }

  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <ClipboardList className="size-4" />
        Besoins ({cible.besoins.length})
      </h3>
      {cible.besoins.map((b) => {
        const statut = statutBesoinMeta(b.statut)
        const prio = prioriteBesoinMeta(b.priorite)
        return (
          <div key={b.id_besoin} className="flex items-start justify-between gap-2 rounded-md border px-3 py-2">
            <div className="min-w-0">
              <p className="text-sm">{b.description}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                <Badge variant={prio.variant}>{prio.label}</Badge>
                <Badge variant={statut.variant}>{statut.label}</Badge>
                {b.type_action_libelle && <Badge variant="outline">{b.type_action_libelle}</Badge>}
              </div>
            </div>
            {b.statut === 'IDENTIFIE' && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => modifier.mutate({ idBesoin: b.id_besoin, payload: { statut: 'ABANDONNE' } })}
                >
                  Abandonner
                </Button>
                <Button size="icon" variant="ghost" className="size-7" aria-label="Supprimer" onClick={() => supprimer.mutate(b.id_besoin)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
        )
      })}
      <div className="space-y-2 rounded-md border border-dashed p-3">
        <Input
          placeholder="Nouveau besoin : toilettes à refaire, kits pour 40 élèves…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && soumettre()}
        />
        <div className="grid grid-cols-2 gap-2">
          <Select value={priorite} onValueChange={(p) => setPriorite(p as PrioriteBesoin)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['URGENTE', 'HAUTE', 'MOYENNE', 'BASSE'] as PrioriteBesoin[]).map((p) => (
                <SelectItem key={p} value={p}>
                  Priorité {prioriteBesoinMeta(p).label.toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeAction} onValueChange={setTypeAction}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AUCUN}>Type d'action : à définir</SelectItem>
              {typesPossibles.map((t) => (
                <SelectItem key={t.id_type_action} value={String(t.id_type_action)}>
                  {t.libelle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={soumettre} disabled={!description.trim() || ajouter.isPending}>
          <Plus className="size-4" />
          Ajouter le besoin
        </Button>
      </div>
    </section>
  )
}
