import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, ChevronDown, MapPin, Pencil, Trash2, User } from 'lucide-react'
import {
  Badge,
  Button,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { useFicheAction, useMutationFiche, useSupprimerAction } from '@/lib/queries'
import { actionsApi } from '@/lib/api/actions'
import { formatDate } from '@/lib/utils/format'
import { actionVersStatut, statutActionMeta } from '@/lib/utils/status'
import type { StatutAction } from '@/lib/api/types'
import { ActionDialog } from './actions/ActionDialog'
import { OngletBilan, OngletCibles, OngletEquipe, OngletPartenaires, OngletTaches } from './actions/OngletsAction'

/** Fiche d'une action : préparation, déroulement et bilan au même endroit. */
export default function ActionFiche() {
  const idAction = Number(useParams().idAction)
  const navigate = useNavigate()
  const fiche = useFicheAction(idAction)
  const changerStatut = useMutationFiche(idAction, (statut: StatutAction) => actionsApi.changerStatut(idAction, statut), 'Statut mis à jour')
  const supprimer = useSupprimerAction()
  const [edition, setEdition] = useState(false)
  const [statutAConfirmer, setStatutAConfirmer] = useState<StatutAction | null>(null)
  const [confirmerSuppression, setConfirmerSuppression] = useState(false)

  if (fiche.isLoading || !fiche.data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }
  const action = fiche.data
  const meta = statutActionMeta(action.statut)
  const equipeAValider = action.equipe.filter((e) => e.statut === 'PROPOSE').length

  return (
    <div className="space-y-5">
      <Link to="/admin/actions" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Toutes les actions
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-xl font-semibold text-foreground">{action.titre}</h1>
            <Badge variant={meta.variant}>{meta.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{action.type_action_libelle}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {formatDate(action.date_debut)}
              {action.date_fin && action.date_fin !== action.date_debut ? ` → ${formatDate(action.date_fin)}` : ''}
            </span>
            {(action.lieu || action.zone_chemin) && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {[action.lieu, action.zone_chemin].filter(Boolean).join(' · ')}
              </span>
            )}
            {action.responsable && (
              <span className="flex items-center gap-1.5">
                <User className="size-4" />
                {action.responsable}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {action.transitions_possibles.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  Étape suivante
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {action.transitions_possibles.map((s) => (
                  <DropdownMenuItem key={s} onClick={() => setStatutAConfirmer(s)}>
                    {actionVersStatut[s]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button variant="outline" onClick={() => setEdition(true)}>
            <Pencil className="size-4" />
            Modifier
          </Button>
          {action.statut === 'BROUILLON' && (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmerSuppression(true)}>
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </div>
      {action.description && <p className="whitespace-pre-line text-sm">{action.description}</p>}

      <Tabs defaultValue="cibles">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="cibles">
            Cibles ({action.nombre_cibles_servies}/{action.nombre_cibles})
          </TabsTrigger>
          <TabsTrigger value="equipe">
            Équipe ({action.nombre_equipe}){equipeAValider > 0 && <Badge variant="warning" className="ml-1.5">{equipeAValider}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="taches">Tâches ({action.taches_restantes} à faire)</TabsTrigger>
          <TabsTrigger value="partenaires">Partenaires ({action.partenaires.length})</TabsTrigger>
          <TabsTrigger value="bilan">Bilan</TabsTrigger>
        </TabsList>
        <TabsContent value="cibles" className="pt-4">
          <OngletCibles action={action} />
        </TabsContent>
        <TabsContent value="equipe" className="pt-4">
          <OngletEquipe action={action} />
        </TabsContent>
        <TabsContent value="taches" className="pt-4">
          <OngletTaches action={action} />
        </TabsContent>
        <TabsContent value="partenaires" className="pt-4">
          <OngletPartenaires action={action} />
        </TabsContent>
        <TabsContent value="bilan" className="pt-4">
          <OngletBilan key={action.id_action} action={action} />
        </TabsContent>
      </Tabs>

      <ActionDialog open={edition} onOpenChange={setEdition} action={action} />
      <ConfirmDialog
        open={statutAConfirmer !== null}
        onOpenChange={(o) => !o && setStatutAConfirmer(null)}
        title={statutAConfirmer ? actionVersStatut[statutAConfirmer] : ''}
        description={
          statutAConfirmer === 'PLANIFIEE'
            ? "Les membres confirmés de l'équipe recevront une convocation."
            : statutAConfirmer === 'TERMINEE'
              ? 'Les besoins des cibles servies passeront à « couvert ». Seuls le bilan et les indicateurs de suivi resteront modifiables.'
              : statutAConfirmer === 'ANNULEE'
                ? "L'action sera annulée et les besoins redeviendront « à couvrir »."
                : undefined
        }
        variant={statutAConfirmer === 'ANNULEE' ? 'destructive' : 'default'}
        loading={changerStatut.isPending}
        onConfirm={() => statutAConfirmer && changerStatut.mutate(statutAConfirmer, { onSettled: () => setStatutAConfirmer(null) })}
      />
      <ConfirmDialog
        open={confirmerSuppression}
        onOpenChange={setConfirmerSuppression}
        title="Supprimer l'action"
        description={`Supprimer « ${action.titre} » ? Ses besoins redeviendront « à couvrir ».`}
        confirmLabel="Supprimer"
        variant="destructive"
        loading={supprimer.isPending}
        onConfirm={() => supprimer.mutate(action.id_action, { onSuccess: () => navigate('/admin/actions') })}
      />
    </div>
  )
}
