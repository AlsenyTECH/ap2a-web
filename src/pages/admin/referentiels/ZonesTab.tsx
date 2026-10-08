import { useState, type FormEvent } from 'react'
import { ChevronRight, Loader2, MapPin, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Input,
  Label,
  Skeleton,
  Switch,
} from '@/components/ui'
import {
  useCreerZone,
  useModifierZone,
  useRechercheZones,
  useSupprimerZone,
  useZones,
} from '@/lib/queries'
import { niveauEnfant, niveauZoneLabel } from '@/lib/utils/status'
import type { Zone } from '@/lib/api/types'

/**
 * Navigation dans le découpage administratif : régions > départements >
 * communes > quartiers. Les régions et départements du Sénégal sont
 * préchargés ; l'association ajoute ses communes et quartiers.
 */
export function ZonesTab() {
  const [fil, setFil] = useState<Zone[]>([])
  const [recherche, setRecherche] = useState('')
  const [nouvelleZone, setNouvelleZone] = useState('')
  const [voirInactives, setVoirInactives] = useState(false)
  const [zoneARenommer, setZoneARenommer] = useState<Zone | null>(null)
  const [nouveauNom, setNouveauNom] = useState('')
  const [zoneASupprimer, setZoneASupprimer] = useState<Zone | null>(null)

  const courante = fil.at(-1) ?? null
  const niveauAjout = courante ? niveauEnfant[courante.niveau] : null
  const zones = useZones(courante?.id_zone ?? 'racine', voirInactives)
  const resultats = useRechercheZones(recherche)
  const creer = useCreerZone()
  const modifier = useModifierZone()
  const supprimer = useSupprimerZone()

  function ouvrir(zone: Zone) {
    if (!niveauEnfant[zone.niveau]) return
    setFil((prev) => [...prev, zone])
    setNouvelleZone('')
  }

  function ouvrirDepuisRecherche(zone: Zone) {
    // Le fil complet n'est pas connu ici : on repart de la zone trouvée.
    setRecherche('')
    setFil(niveauEnfant[zone.niveau] ? [zone] : [])
  }

  async function ajouter(e: FormEvent) {
    e.preventDefault()
    if (!courante || !niveauAjout || !nouvelleZone.trim()) return
    try {
      await creer.mutateAsync({ nom: nouvelleZone.trim(), niveau: niveauAjout, parent: courante.id_zone })
      setNouvelleZone('')
    } catch {
      // toast déjà affiché
    }
  }

  async function renommer() {
    if (!zoneARenommer || !nouveauNom.trim()) return
    try {
      await modifier.mutateAsync({ idZone: zoneARenommer.id_zone, payload: { nom: nouveauNom.trim() } })
      setZoneARenommer(null)
    } catch {
      // toast déjà affiché
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Rechercher une zone (2 lettres minimum)"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
      </div>

      {recherche.trim().length >= 2 ? (
        <Card>
          <CardContent className="divide-y p-0">
            {resultats.isLoading && <Skeleton className="m-4 h-6" />}
            {resultats.data?.length === 0 && <p className="p-4 text-sm text-muted-foreground">Aucune zone trouvée.</p>}
            {resultats.data?.map((zone) => (
              <button
                key={zone.id_zone}
                type="button"
                onClick={() => ouvrirDepuisRecherche(zone)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted/50"
              >
                <span>{zone.chemin}</span>
                <Badge variant="secondary">{niveauZoneLabel[zone.niveau]}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>
      ) : (
        <>
          <nav className="flex flex-wrap items-center gap-1 text-sm" aria-label="Fil d'Ariane">
            <button type="button" className="font-medium text-primary hover:underline" onClick={() => setFil([])}>
              Sénégal
            </button>
            {fil.map((zone, i) => (
              <span key={zone.id_zone} className="flex items-center gap-1">
                <ChevronRight className="size-3.5 text-muted-foreground" />
                <button
                  type="button"
                  className="font-medium text-primary hover:underline disabled:text-foreground disabled:no-underline"
                  disabled={i === fil.length - 1}
                  onClick={() => setFil(fil.slice(0, i + 1))}
                >
                  {zone.nom}
                </button>
              </span>
            ))}
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {niveauAjout ? (
              <form onSubmit={ajouter} className="flex w-full max-w-md gap-2">
                <Input
                  placeholder={`Nouvelle ${niveauZoneLabel[niveauAjout].toLowerCase()} dans ${courante?.nom}`}
                  value={nouvelleZone}
                  onChange={(e) => setNouvelleZone(e.target.value)}
                />
                <Button type="submit" disabled={creer.isPending || !nouvelleZone.trim()}>
                  {creer.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                  Ajouter
                </Button>
              </form>
            ) : (
              <p className="text-xs text-muted-foreground">
                Les 14 régions et 46 départements sont fournis. Ouvrez un département pour y ajouter des communes.
              </p>
            )}
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Switch checked={voirInactives} onCheckedChange={setVoirInactives} />
              Afficher les zones désactivées
            </label>
          </div>

          {zones.isLoading && <Skeleton className="h-40 w-full" />}
          {!zones.isLoading && zones.data?.length === 0 && (
            <EmptyState icon={MapPin} title="Aucune zone ici" description="Ajoutez la première avec le champ ci-dessus." />
          )}
          {!zones.isLoading && zones.data && zones.data.length > 0 && (
            <Card>
              <CardContent className="divide-y p-0">
                {zones.data.map((zone) => (
                  <div key={zone.id_zone} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => ouvrir(zone)}
                      disabled={!niveauEnfant[zone.niveau]}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm disabled:cursor-default"
                    >
                      <span className={zone.actif ? 'font-medium' : 'text-muted-foreground line-through'}>{zone.nom}</span>
                      {zone.nombre_sous_zones > 0 && (
                        <Badge variant="outline">
                          {zone.nombre_sous_zones} {niveauZoneLabel[niveauEnfant[zone.niveau] ?? zone.niveau].toLowerCase()}(s)
                        </Badge>
                      )}
                      {niveauEnfant[zone.niveau] && <ChevronRight className="size-4 text-muted-foreground" />}
                    </button>
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={zone.actif}
                        aria-label="Zone active"
                        onCheckedChange={(actif) => modifier.mutate({ idZone: zone.id_zone, payload: { actif } })}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        aria-label="Renommer"
                        onClick={() => {
                          setZoneARenommer(zone)
                          setNouveauNom(zone.nom)
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        aria-label="Supprimer"
                        onClick={() => setZoneASupprimer(zone)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog open={Boolean(zoneARenommer)} onOpenChange={(open) => !open && setZoneARenommer(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Renommer la zone</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="zone-nom">Nom</Label>
            <Input id="zone-nom" value={nouveauNom} onChange={(e) => setNouveauNom(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setZoneARenommer(null)}>
              Annuler
            </Button>
            <Button onClick={renommer} disabled={modifier.isPending || !nouveauNom.trim()}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(zoneASupprimer)}
        onOpenChange={(open) => !open && setZoneASupprimer(null)}
        title="Supprimer la zone"
        description={`Supprimer « ${zoneASupprimer?.chemin ?? ''} » ? Une zone qui contient des sous-zones ne peut pas être supprimée : désactivez-la plutôt.`}
        confirmLabel="Supprimer"
        variant="destructive"
        loading={supprimer.isPending}
        onConfirm={async () => {
          if (!zoneASupprimer) return
          try {
            await supprimer.mutateAsync(zoneASupprimer.id_zone)
          } catch {
            // toast déjà affiché
          } finally {
            setZoneASupprimer(null)
          }
        }}
      />
    </div>
  )
}
