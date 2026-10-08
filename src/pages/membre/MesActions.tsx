import { CalendarDays, HandHeart, MapPin } from 'lucide-react'
import { Badge, Button, Card, CardContent, EmptyState, Skeleton } from '@/components/ui'
import { useMesActions, useVolontariat } from '@/lib/queries'
import { formatDate } from '@/lib/utils/format'
import { statutEquipeMeta } from '@/lib/utils/status'
import type { ActionMembre } from '@/lib/api/types'

function Infos({ action }: { action: ActionMembre }) {
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      <p className="flex items-center gap-1.5">
        <CalendarDays className="size-3.5" />
        {formatDate(action.date_debut)}
        {action.date_fin && action.date_fin !== action.date_debut ? ` → ${formatDate(action.date_fin)}` : ''}
      </p>
      {(action.lieu || action.zone_chemin) && (
        <p className="flex items-center gap-1.5">
          <MapPin className="size-3.5" />
          {[action.lieu, action.zone_chemin].filter(Boolean).join(' · ')}
        </p>
      )}
    </div>
  )
}

/** Espace membre : se porter volontaire sur une action, et voir ses missions. */
export default function MesActions() {
  const mes = useMesActions()
  const volontariat = useVolontariat()

  if (mes.isLoading || !mes.data) return <Skeleton className="h-64 w-full" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-foreground">Actions & missions</h1>
        <p className="text-sm text-muted-foreground">Proposez votre aide sur les actions de l'association et retrouvez vos missions.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">On a besoin de vous</h2>
        {mes.data.appels.length === 0 && (
          <EmptyState icon={HandHeart} title="Aucun appel en cours" description="Les prochains appels à volontaires apparaîtront ici." />
        )}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {mes.data.appels.map((a) => (
            <Card key={a.id_action}>
              <CardContent className="space-y-2 p-4">
                <p className="font-medium">{a.titre}</p>
                <p className="text-xs text-muted-foreground">{a.type_action_libelle}</p>
                <Infos action={a} />
                {a.description && <p className="line-clamp-3 text-sm">{a.description}</p>}
                {a.volontaires_souhaites && (
                  <p className="text-xs">
                    {a.nombre_equipe} / {a.volontaires_souhaites} volontaires
                  </p>
                )}
                <Button className="w-full" disabled={volontariat.isPending} onClick={() => volontariat.mutate({ idAction: a.id_action })}>
                  <HandHeart className="size-4" />
                  Je me porte volontaire
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Mes missions</h2>
        {mes.data.missions.length === 0 && <p className="text-sm text-muted-foreground">Vous n'avez pas encore de mission.</p>}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {mes.data.missions.map((m) => {
            const meta = statutEquipeMeta(m.statut_equipe)
            const aVenir = m.statut === 'BROUILLON' || m.statut === 'PLANIFIEE'
            return (
              <Card key={m.id_membre_equipe}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{m.titre}</p>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </div>
                  {m.role && <p className="text-sm">Rôle : {m.role}</p>}
                  <Infos action={m} />
                  {aVenir && m.statut_equipe !== 'DECLINE' && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={volontariat.isPending}
                      onClick={() => volontariat.mutate({ idAction: m.id_action, retirer: true })}
                    >
                      {m.statut_equipe === 'PROPOSE' ? 'Retirer ma proposition' : 'Je ne suis plus disponible'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
