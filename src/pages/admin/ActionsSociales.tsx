import { useMemo, useState } from 'react'
import { HandHeart, HeartHandshake, HelpCircle, Plus, ShoppingBag, Stethoscope, Wrench } from 'lucide-react'
import {
  Badge,
  EmptyState,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from '@/components/ui'
import { MasterDetailLayout } from '@/components/shared/MasterDetailLayout'
import { useActionsSociales } from '@/lib/queries'
import { statutActionSocialeMeta, typeActionSocialeLabel } from '@/lib/utils/status'
import type { ActionSocialeListItem, StatutActionSociale, TypeActionSociale } from '@/lib/api/types'
import { CreateActionDialog } from './actions-sociales/CreateActionDialog'
import { ActionDetailPanel } from './actions-sociales/ActionDetailPanel'

const TYPE_ICONS: Record<TypeActionSociale, typeof ShoppingBag> = {
  DON: HeartHandshake,
  COMMERCE: ShoppingBag,
  ATELIER: Wrench,
  MEDICAL: Stethoscope,
  AUTRE: HelpCircle,
}

const FILTER_ALL = 'TOUS'

export default function ActionsSociales() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>(FILTER_ALL)
  const [statutFilter, setStatutFilter] = useState<string>(FILTER_ALL)

  const actions = useActionsSociales({
    type: typeFilter === FILTER_ALL ? undefined : (typeFilter as TypeActionSociale),
    statut: statutFilter === FILTER_ALL ? undefined : (statutFilter as StatutActionSociale),
  })

  const items = actions.data ?? []
  const selected = useMemo(() => items.find((a) => a.id_action === selectedId) ?? null, [items, selectedId])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground">Actions sociales</h1>
          <p className="text-sm text-muted-foreground">Suivi des actions sociales et de leurs bénéficiaires.</p>
        </div>
      </div>

      <MasterDetailLayout<ActionSocialeListItem>
        orientation="stacked"
        items={items}
        getId={(item) => item.id_action}
        selectedId={selectedId}
        onSelect={(item) => setSelectedId(item.id_action)}
        listLoading={actions.isLoading}
        listHeader={
          <div className="space-y-2">
            <Button className="w-full" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Nouvelle action
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FILTER_ALL}>Tous les types</SelectItem>
                  {Object.entries(typeActionSocialeLabel).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statutFilter} onValueChange={setStatutFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FILTER_ALL}>Tous les statuts</SelectItem>
                  <SelectItem value="PLANIFIE">Planifiée</SelectItem>
                  <SelectItem value="EN_COURS">En cours</SelectItem>
                  <SelectItem value="TERMINE">Terminée</SelectItem>
                  <SelectItem value="ANNULE">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        }
        emptyList={
          <EmptyState icon={HandHeart} title="Aucune action sociale" description="Créez votre première action sociale." />
        }
        renderItem={(item) => {
          const meta = statutActionSocialeMeta(item.statut)
          const Icon = TYPE_ICONS[item.type_action] ?? HelpCircle
          return (
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{item.titre}</p>
                  <Badge variant={meta.variant} className="shrink-0">
                    {meta.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.nb_beneficiaires} bénéficiaire(s)</p>
              </div>
            </div>
          )
        }}
        detail={
          selected ? (
            <ActionDetailPanel key={selected.id_action} idAction={selected.id_action} />
          ) : (
            <EmptyState
              icon={HandHeart}
              title="Sélectionnez une action"
              description="Choisissez une action sociale dans la liste pour voir ses détails."
              className="h-full"
            />
          )
        }
      />

      <CreateActionDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
