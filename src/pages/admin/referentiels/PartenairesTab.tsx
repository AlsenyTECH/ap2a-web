import { useState } from 'react'
import { Handshake, Mail, MapPin, Pencil, Phone, Plus, Search, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  ConfirmDialog,
  EmptyState,
  Input,
  Skeleton,
  Switch,
} from '@/components/ui'
import { useModifierPartenaire, usePartenaires, useSupprimerPartenaire } from '@/lib/queries'
import { typePartenaireLabel } from '@/lib/utils/status'
import type { Partenaire } from '@/lib/api/types'
import { PartenaireDialog } from './PartenaireDialog'

export function PartenairesTab() {
  const [q, setQ] = useState('')
  const [voirInactifs, setVoirInactifs] = useState(false)
  const [dialogue, setDialogue] = useState<{ ouvert: boolean; partenaire: Partenaire | null }>({
    ouvert: false,
    partenaire: null,
  })
  const [aSupprimer, setASupprimer] = useState<Partenaire | null>(null)
  const partenaires = usePartenaires(q.trim(), voirInactifs)
  const modifier = useModifierPartenaire()
  const supprimer = useSupprimerPartenaire()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Nom ou sigle" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Switch checked={voirInactifs} onCheckedChange={setVoirInactifs} />
            Afficher les inactifs
          </label>
        </div>
        <Button onClick={() => setDialogue({ ouvert: true, partenaire: null })}>
          <Plus className="size-4" />
          Nouveau partenaire
        </Button>
      </div>

      {partenaires.isLoading && <Skeleton className="h-40 w-full" />}
      {!partenaires.isLoading && partenaires.data?.length === 0 && (
        <EmptyState
          icon={Handshake}
          title="Aucun partenaire"
          description="Ajoutez les organismes de formation, structures de santé, bailleurs… avec qui l'association travaille."
        />
      )}
      {partenaires.data && partenaires.data.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {partenaires.data.map((p) => (
            <Card key={p.id_partenaire} className={p.actif ? undefined : 'opacity-60'}>
              <CardContent className="space-y-2 pt-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{p.nom}</p>
                    {p.sigle && <p className="text-xs text-muted-foreground">{p.sigle}</p>}
                  </div>
                  <Badge variant="secondary">{typePartenaireLabel[p.type_partenaire]}</Badge>
                </div>
                {p.domaines && <p className="line-clamp-2 text-xs text-muted-foreground">{p.domaines}</p>}
                <div className="space-y-1 text-xs text-muted-foreground">
                  {p.zone_chemin && (
                    <p className="flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      {p.zone_chemin}
                    </p>
                  )}
                  {p.telephone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="size-3.5" />
                      {p.nom_contact ? `${p.nom_contact} · ` : ''}
                      {p.telephone}
                    </p>
                  )}
                  {p.email && (
                    <p className="flex items-center gap-1.5">
                      <Mail className="size-3.5" />
                      {p.email}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch
                      checked={p.actif}
                      onCheckedChange={(actif) => modifier.mutate({ idPartenaire: p.id_partenaire, payload: { actif } })}
                    />
                    Actif
                  </label>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      aria-label="Modifier"
                      onClick={() => setDialogue({ ouvert: true, partenaire: p })}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive"
                      aria-label="Supprimer"
                      onClick={() => setASupprimer(p)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PartenaireDialog
        open={dialogue.ouvert}
        partenaire={dialogue.partenaire}
        onOpenChange={(ouvert) => setDialogue((d) => ({ ...d, ouvert }))}
      />

      <ConfirmDialog
        open={Boolean(aSupprimer)}
        onOpenChange={(open) => !open && setASupprimer(null)}
        title="Supprimer le partenaire"
        description={`Supprimer « ${aSupprimer?.nom ?? ''} » ? S'il est déjà lié à des actions, désactivez-le plutôt.`}
        confirmLabel="Supprimer"
        variant="destructive"
        loading={supprimer.isPending}
        onConfirm={async () => {
          if (!aSupprimer) return
          try {
            await supprimer.mutateAsync(aSupprimer.id_partenaire)
          } catch {
            // toast déjà affiché
          } finally {
            setASupprimer(null)
          }
        }}
      />
    </div>
  )
}
