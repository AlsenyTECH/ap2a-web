import { useState } from 'react'
import { GraduationCap } from 'lucide-react'
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { useFormations, useMesCohortes } from '@/lib/queries'
import { formatDate } from '@/lib/utils/format'
import { statutCohorteMeta } from '@/lib/utils/status'
import type { Formation } from '@/lib/api/types'
import { FormationCohortesSheet } from './formations/FormationCohortesSheet'

export default function MesFormations() {
  const { data: formations, isLoading: loadingFormations } = useFormations()
  const { data: mesCohortes, isLoading: loadingMesCohortes } = useMesCohortes()
  const [formationOuverte, setFormationOuverte] = useState<Formation | null>(null)

  // Formation n'a pas de statut propre (seules les cohortes en ont
  // un) - le catalogue liste simplement toutes les formations
  // proposées par l'association.
  const catalogue = formations ?? []

  return (
    <div className="space-y-6">
      <Tabs defaultValue="catalogue">
        <TabsList>
          <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
          <TabsTrigger value="inscriptions">Mes inscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="catalogue">
          {loadingFormations ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ) : catalogue.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="Aucune formation disponible"
              description="Le catalogue de formations est vide pour le moment."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {catalogue.map((formation) => (
                <Card
                  key={formation.id_formation}
                  className="cursor-pointer transition-shadow duration-150 hover:shadow-md"
                  onClick={() => setFormationOuverte(formation)}
                >
                  <CardHeader>
                    <CardTitle className="text-base">{formation.titre}</CardTitle>
                    {formation.domaine && <CardDescription>{formation.domaine}</CardDescription>}
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {formation.duree_heures !== null && <span>{formation.duree_heures} h</span>}
                    <span>&middot;</span>
                    <span>
                      {formation.nombre_cohortes} cohorte{formation.nombre_cohortes > 1 ? 's' : ''}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inscriptions">
          {loadingMesCohortes ? (
            <Skeleton className="h-48 w-full rounded-lg" />
          ) : !mesCohortes || mesCohortes.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="Aucune inscription"
              description="Vous n'êtes inscrit à aucune cohorte pour le moment."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cohorte</TableHead>
                  <TableHead>Formation</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Inscription</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mesCohortes.map((c) => {
                  const meta = statutCohorteMeta(c.statut_cohorte)
                  return (
                    <TableRow key={c.id_cohorte}>
                      <TableCell className="font-medium">{c.code_cohorte}</TableCell>
                      <TableCell>{c.formation}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(c.date_debut)} — {formatDate(c.date_fin)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.statut_inscription}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      <FormationCohortesSheet
        formation={formationOuverte}
        onOpenChange={(open) => !open && setFormationOuverte(null)}
      />
    </div>
  )
}
