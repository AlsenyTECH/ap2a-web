import { ListChecks, MapPinned, Handshake } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { ZonesTab } from './referentiels/ZonesTab'
import { PartenairesTab } from './referentiels/PartenairesTab'
import { TypesActionTab } from './referentiels/TypesActionTab'

/**
 * Paramétrage commun du suivi des actions : où l'association intervient
 * (zones), avec qui (partenaires), et quelles actions elle mène avec quels
 * indicateurs (types d'action).
 */
export default function Referentiels() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-foreground">Référentiels</h1>
        <p className="text-sm text-muted-foreground">
          Zones d'intervention, partenaires, types d'action et indicateurs de suivi utilisés par toutes les actions.
        </p>
      </div>

      <Tabs defaultValue="types">
        <TabsList className="flex-wrap">
          <TabsTrigger value="types">
            <ListChecks className="mr-1.5 size-4" />
            Types d'action & indicateurs
          </TabsTrigger>
          <TabsTrigger value="partenaires">
            <Handshake className="mr-1.5 size-4" />
            Partenaires
          </TabsTrigger>
          <TabsTrigger value="zones">
            <MapPinned className="mr-1.5 size-4" />
            Zones
          </TabsTrigger>
        </TabsList>
        <TabsContent value="types" className="pt-4">
          <TypesActionTab />
        </TabsContent>
        <TabsContent value="partenaires" className="pt-4">
          <PartenairesTab />
        </TabsContent>
        <TabsContent value="zones" className="pt-4">
          <ZonesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
