import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge, Button, Card, CardContent, Skeleton } from '@/components/ui'
import { useCalendrier } from '@/lib/queries'
import { cn } from '@/lib/utils'
import type { ElementCalendrier } from '@/lib/api/types'

const COULEURS: Record<ElementCalendrier['nature'], string> = {
  ACTION: 'bg-primary/15 text-primary border-primary/30',
  EVENEMENT: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  FORMATION: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
}
const LIBELLES: Record<ElementCalendrier['nature'], string> = { ACTION: 'Action', EVENEMENT: 'Événement', FORMATION: 'Formation' }
const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function iso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** Vue d'ensemble du mois : actions, événements et séances de formation. */
export default function Calendrier() {
  const navigate = useNavigate()
  const [mois, setMois] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  // Grille du lundi précédant le 1er au dimanche suivant le dernier jour.
  const jours = useMemo(() => {
    const debut = new Date(mois)
    debut.setDate(1 - ((mois.getDay() + 6) % 7))
    const fin = new Date(mois.getFullYear(), mois.getMonth() + 1, 0)
    fin.setDate(fin.getDate() + (6 - ((fin.getDay() + 6) % 7)))
    const liste: Date[] = []
    for (const d = new Date(debut); d <= fin; d.setDate(d.getDate() + 1)) liste.push(new Date(d))
    return liste
  }, [mois])

  const calendrier = useCalendrier(iso(jours[0]), iso(jours[jours.length - 1]))
  const aujourdhui = iso(new Date())

  function elementsDu(jour: string) {
    return (calendrier.data ?? []).filter((e) => e.debut <= jour && jour <= e.fin)
  }

  function ouvrir(e: ElementCalendrier) {
    if (e.nature === 'ACTION') navigate(`/admin/actions/${e.id}`)
    else if (e.nature === 'EVENEMENT') navigate('/admin/evenements')
    else navigate('/admin/formations')
  }

  const libelleMois = mois.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const duMois = (calendrier.data ?? []).filter((e) => e.fin >= iso(mois) && e.debut <= iso(new Date(mois.getFullYear(), mois.getMonth() + 1, 0)))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground">Calendrier</h1>
          <p className="text-sm text-muted-foreground">Toutes les activités de l'association : actions, événements et formations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Mois précédent" onClick={() => setMois(new Date(mois.getFullYear(), mois.getMonth() - 1, 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-36 text-center font-medium capitalize">{libelleMois}</span>
          <Button variant="outline" size="icon" aria-label="Mois suivant" onClick={() => setMois(new Date(mois.getFullYear(), mois.getMonth() + 1, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(LIBELLES) as ElementCalendrier['nature'][]).map((n) => (
          <span key={n} className={cn('rounded border px-2 py-0.5 text-xs', COULEURS[n])}>
            {LIBELLES[n]}
          </span>
        ))}
      </div>

      {calendrier.isLoading && <Skeleton className="h-96 w-full" />}

      {/* Grille mensuelle (écrans larges) */}
      <div className="hidden overflow-hidden rounded-md border md:block">
        <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-medium">
          {JOURS.map((j) => (
            <div key={j} className="py-2">
              {j}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {jours.map((d) => {
            const jour = iso(d)
            const elements = elementsDu(jour)
            return (
              <div key={jour} className={cn('min-h-24 border-b border-r p-1', d.getMonth() !== mois.getMonth() && 'bg-muted/20 text-muted-foreground')}>
                <p className={cn('mb-1 text-xs', jour === aujourdhui && 'inline-block rounded-full bg-primary px-1.5 text-primary-foreground')}>
                  {d.getDate()}
                </p>
                <div className="space-y-0.5">
                  {elements.slice(0, 3).map((e) => (
                    <button
                      key={`${e.nature}-${e.id}-${jour}`}
                      type="button"
                      onClick={() => ouvrir(e)}
                      title={`${e.titre} · ${e.sous_titre}`}
                      className={cn('block w-full truncate rounded border px-1 text-left text-[11px]', COULEURS[e.nature])}
                    >
                      {e.titre}
                    </button>
                  ))}
                  {elements.length > 3 && <p className="text-[11px] text-muted-foreground">+{elements.length - 3}</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Liste chronologique (téléphone) */}
      <div className="space-y-2 md:hidden">
        {duMois.length === 0 && !calendrier.isLoading && <p className="text-sm text-muted-foreground">Rien de prévu ce mois-ci.</p>}
        {duMois.map((e) => (
          <Card key={`${e.nature}-${e.id}-${e.debut}`} onClick={() => ouvrir(e)} className="cursor-pointer">
            <CardContent className="flex items-start justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{e.titre}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(e.debut).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  {e.fin !== e.debut ? ` → ${new Date(e.fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}` : ''}
                  {e.lieu ? ` · ${e.lieu}` : ''}
                </p>
              </div>
              <Badge variant="outline" className={COULEURS[e.nature]}>
                {LIBELLES[e.nature]}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
