import { useMemo, useState } from 'react'
import { BookUser, Network, Search } from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  EmptyState,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { mediaUrl } from '@/lib/api/client'
import { initials } from '@/lib/utils/format'
import { fonctionAssociationLabel, FONCTIONS_DIRECTION } from '@/lib/utils/status'
import { useAnnuaire } from '@/lib/queries'
import type { FonctionAssociation, MembreAnnuaire } from '@/lib/api/types'

function CarteMembre({ membre }: { membre: MembreAnnuaire }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <Avatar className="size-12">
        {membre.photo ? <AvatarImage src={mediaUrl(membre.photo)} alt={`${membre.prenom} ${membre.nom}`} /> : null}
        <AvatarFallback>{initials(membre.nom, membre.prenom)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">
          {membre.prenom} {membre.nom}
        </p>
        <p className="truncate text-xs text-muted-foreground">{membre.fonction_association_libelle}</p>
        {membre.section && <p className="truncate text-xs text-muted-foreground">{membre.section}</p>}
      </div>
    </div>
  )
}

function Organigramme({ membres }: { membres: MembreAnnuaire[] }) {
  const parFonction = useMemo(() => {
    const groupes = new Map<string, MembreAnnuaire[]>()
    for (const fonction of FONCTIONS_DIRECTION) groupes.set(fonction, [])
    for (const m of membres) {
      if (groupes.has(m.fonction_association)) groupes.get(m.fonction_association)!.push(m)
    }
    return groupes
  }, [membres])

  const toutVide = FONCTIONS_DIRECTION.every((f) => (parFonction.get(f) ?? []).length === 0)

  if (toutVide) {
    return (
      <EmptyState
        icon={Network}
        title="Aucun membre du bureau exécutif"
        description="Attribuez une fonction de direction à un membre pour qu'il apparaisse ici."
      />
    )
  }

  return (
    <div className="space-y-6">
      {FONCTIONS_DIRECTION.map((fonction) => {
        const liste = parFonction.get(fonction) ?? []
        if (liste.length === 0) return null
        return (
          <div key={fonction}>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {fonctionAssociationLabel[fonction]}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {liste.map((m) => (
                <CarteMembre key={m.id_membre} membre={m} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Annuaire() {
  const [search, setSearch] = useState('')
  const [fonction, setFonction] = useState<string>('TOUTES')

  const { data: membres, isLoading } = useAnnuaire({
    fonction: fonction === 'TOUTES' ? undefined : (fonction as FonctionAssociation),
    q: search || undefined,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Annuaire</h1>
        <p className="text-sm text-muted-foreground">
          Répertoire interne des membres AP2A - réseautage entre officiels, entrepreneurs et jeunes.
        </p>
      </div>

      <Tabs defaultValue="annuaire">
        <TabsList>
          <TabsTrigger value="annuaire">
            <BookUser className="size-4 mr-1.5" />
            Annuaire
          </TabsTrigger>
          <TabsTrigger value="organigramme">
            <Network className="size-4 mr-1.5" />
            Organigramme
          </TabsTrigger>
        </TabsList>

        <TabsContent value="annuaire" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un membre…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={fonction} onValueChange={setFonction}>
              <SelectTrigger className="sm:w-64">
                <SelectValue placeholder="Fonction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TOUTES">Toutes les fonctions</SelectItem>
                {Object.entries(fonctionAssociationLabel).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !membres || membres.length === 0 ? (
            <EmptyState icon={BookUser} title="Aucun membre trouvé" description="Essayez de modifier vos filtres." />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {membres.map((m) => (
                <CarteMembre key={m.id_membre} membre={m} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="organigramme">
          {isLoading ? <Skeleton className="h-40 w-full" /> : <Organigramme membres={membres ?? []} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
