import { useMemo, useState } from 'react'
import { CalendarDays, Plus } from 'lucide-react'
import { Badge, Button, EmptyState, Tabs, TabsList, TabsTrigger } from '@/components/ui'
import { MasterDetailLayout } from '@/components/shared/MasterDetailLayout'
import { useEvenements, useEvenementsHistorique } from '@/lib/queries'
import { typeEvenementLabel } from '@/lib/utils/status'
import type { EvenementListItem } from '@/lib/api/types'
import { CreateEvenementDialog } from './evenements/CreateEvenementDialog'
import { EvenementDetailPanel } from './evenements/EvenementDetailPanel'

type EvenementItem = EvenementListItem & { nombre_participants?: number; est_termine?: boolean }

type OngletEvenement = 'en-cours' | 'historique'

export default function Evenements() {
  const [onglet, setOnglet] = useState<OngletEvenement>('en-cours')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const enCours = useEvenements()
  const historique = useEvenementsHistorique()

  const isLoading = onglet === 'en-cours' ? enCours.isLoading : historique.isLoading
  const items: EvenementItem[] = onglet === 'en-cours' ? (enCours.data ?? []) : (historique.data ?? [])

  const selected = useMemo(() => items.find((e) => e.id_evenement === selectedId) ?? null, [items, selectedId])

  function handleTabChange(value: string) {
    setOnglet(value as OngletEvenement)
    setSelectedId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground">Événements</h1>
          <p className="text-sm text-muted-foreground">Gestion des événements, confirmations et présences.</p>
        </div>
      </div>

      <MasterDetailLayout<EvenementItem>
        items={items}
        getId={(item) => item.id_evenement}
        selectedId={selectedId}
        onSelect={(item) => setSelectedId(item.id_evenement)}
        listLoading={isLoading}
        listHeader={
          <div className="space-y-3">
            <Tabs value={onglet} onValueChange={handleTabChange}>
              <TabsList className="w-full">
                <TabsTrigger value="en-cours" className="flex-1">
                  En cours
                </TabsTrigger>
                <TabsTrigger value="historique" className="flex-1">
                  Historique
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button className="w-full" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Nouvel événement
            </Button>
          </div>
        }
        emptyList={
          <EmptyState
            icon={CalendarDays}
            title="Aucun événement"
            description={onglet === 'en-cours' ? "Créez votre premier événement." : 'Aucun événement terminé.'}
          />
        }
        renderItem={(item) => (
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{item.titre}</p>
              {item.est_annule ? (
                <Badge variant="destructive" className="shrink-0">
                  Annulé
                </Badge>
              ) : item.est_termine ? (
                <Badge variant="outline" className="shrink-0">
                  Terminé
                </Badge>
              ) : (
                <Badge variant="success" className="shrink-0">
                  En cours
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary">{typeEvenementLabel[item.type_evenement] ?? item.type_evenement}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{item.lieu}</p>
            <p className="text-xs text-muted-foreground">
              {item.nombre_seances} séance{item.nombre_seances > 1 ? 's' : ''}
              {typeof item.nombre_participants === 'number' && ` · ${item.nombre_participants} participant(s)`}
            </p>
          </div>
        )}
        detail={
          selected ? (
            <EvenementDetailPanel
              key={selected.id_evenement}
              idEvenement={selected.id_evenement}
              titre={selected.titre}
              typeEvenement={selected.type_evenement}
              showTerminerAction={onglet === 'en-cours'}
            />
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="Sélectionnez un événement"
              description="Choisissez un événement dans la liste pour voir ses détails."
              className="h-full"
            />
          )
        }
      />

      <CreateEvenementDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
