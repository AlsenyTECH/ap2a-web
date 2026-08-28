import { Loader2, ScanLine } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Card, CardContent } from '@/components/ui'
import { mediaUrl } from '@/lib/api/client'
import { initials } from '@/lib/utils/format'
import { statutAdhesionMeta } from '@/lib/utils/status'
import type { StatutAdhesion } from '@/lib/api/types'

interface ResultatVerificationProps {
  nom: string
  prenom: string
  photo?: string | null
  statutAdhesion?: StatutAdhesion | null
  numeroAdherent?: string | null
  onConfirmer: () => void
  confirming: boolean
  disabled?: boolean
}

/**
 * Bloc d'affichage du résultat d'une vérification (recherche manuelle ou
 * scan caméra) avec bouton de confirmation d'entrée. Partagé entre les
 * deux onglets de ControleAcces.tsx pour éviter la duplication.
 */
export function ResultatVerification({
  nom,
  prenom,
  photo,
  statutAdhesion,
  numeroAdherent,
  onConfirmer,
  confirming,
  disabled,
}: ResultatVerificationProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-14">
              {photo ? <AvatarImage src={mediaUrl(photo)} /> : null}
              <AvatarFallback>{initials(nom, prenom)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-heading text-lg font-semibold text-foreground">
                {prenom} {nom}
              </p>
              <div className="flex items-center gap-2">
                {numeroAdherent && <span className="text-xs text-muted-foreground">{numeroAdherent}</span>}
                {statutAdhesion && (
                  <Badge variant={statutAdhesionMeta(statutAdhesion).variant}>
                    {statutAdhesionMeta(statutAdhesion).label}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button onClick={onConfirmer} disabled={disabled || confirming}>
            {confirming ? <Loader2 className="animate-spin" /> : <ScanLine />}
            Confirmer l'entrée
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
