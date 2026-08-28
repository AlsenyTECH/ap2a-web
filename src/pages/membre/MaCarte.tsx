import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { CreditCard, RefreshCw, ShieldAlert, Smartphone } from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  ConfirmDialog,
  Skeleton,
} from '@/components/ui'
import { useDeclarerPerte, useMonProfilMembre, useQrActuel } from '@/lib/queries'
import { mediaUrl } from '@/lib/api/client'
import { formatDate, initials } from '@/lib/utils/format'
import { statutAdhesionMeta, statutCarteMeta } from '@/lib/utils/status'

export default function MaCarte() {
  const { data: profil, isLoading } = useMonProfilMembre()
  const carteQrActive = profil?.carte_qr.statut_carte === 'ACTIVE'
  const { data: qr } = useQrActuel(carteQrActive)
  const declarerPerte = useDeclarerPerte()
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (isLoading || !profil) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    )
  }

  const adhesionMeta = statutAdhesionMeta(profil.statut_adhesion)
  const carteQrMeta = statutCarteMeta(profil.carte_qr.statut_carte)
  const cartePhysiqueMeta = profil.carte_physique ? statutCarteMeta(profil.carte_physique.statut_carte) : null
  const physiqueActive = profil.carte_physique?.statut_carte === 'ACTIVE'

  async function handleConfirmPerte() {
    try {
      await declarerPerte.mutateAsync()
    } finally {
      setConfirmOpen(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-primary px-6 py-5 text-primary-foreground">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border-2 border-primary-foreground/30">
              {profil.photo ? <AvatarImage src={mediaUrl(profil.photo)} alt={`${profil.prenom} ${profil.nom}`} /> : null}
              <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground">
                {initials(profil.nom, profil.prenom)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-heading text-lg font-bold">
                {profil.prenom} {profil.nom}
              </p>
              <p className="text-sm text-primary-foreground/80">N° {profil.numero_adherent}</p>
            </div>
          </div>
        </div>

        <CardContent className="space-y-5 pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Section</p>
              <p className="font-medium text-foreground">{profil.section ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Adhésion depuis</p>
              <p className="font-medium text-foreground">{formatDate(profil.date_adhesion)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Statut adhésion</span>
            <Badge variant={adhesionMeta.variant}>{adhesionMeta.label}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Carte virtuelle QR — toujours disponible, indépendante de la carte physique */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="size-4 text-muted-foreground" />
              <p className="font-heading text-sm font-semibold text-foreground">Carte virtuelle (QR)</p>
            </div>
            <Badge variant={carteQrMeta.variant}>{carteQrMeta.label}</Badge>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-background py-6">
            {carteQrActive ? (
              qr?.contenu_carte ? (
                <>
                  <QRCodeSVG value={qr.contenu_carte} size={220} />
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <RefreshCw className="size-3 animate-spin [animation-duration:3s]" />
                    Actualisation automatique toutes les 10 secondes
                  </div>
                </>
              ) : (
                <Skeleton className="size-[220px]" />
              )
            ) : (
              <div className="flex flex-col items-center gap-2 px-6 text-center">
                <ShieldAlert className="size-10 text-muted-foreground" />
                <p className="font-medium text-foreground">Carte virtuelle inactive</p>
                <p className="text-sm text-muted-foreground">
                  Contactez votre association si vous pensez qu'il s'agit d'une erreur.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Carte physique NFC — remise en personne par l'association, indépendante de la QR */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-muted-foreground" />
              <p className="font-heading text-sm font-semibold text-foreground">Carte physique (NFC)</p>
            </div>
            {cartePhysiqueMeta && <Badge variant={cartePhysiqueMeta.variant}>{cartePhysiqueMeta.label}</Badge>}
          </div>

          {profil.carte_physique ? (
            <>
              <p className="text-sm text-muted-foreground">
                Cette carte physique vous a été remise par l'association. La déclarer perdue ne bloque que celle-ci
                — votre carte virtuelle ci-dessus continue de fonctionner normalement.
              </p>
              {physiqueActive && (
                <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)} className="w-full">
                  Déclarer la perte de ma carte physique
                </Button>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Vous n'avez pas encore de carte physique enregistrée. Rapprochez-vous de l'association pour en obtenir
              une.
            </p>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Déclarer la perte de ma carte physique"
        description="Votre carte physique sera bloquée. Une nouvelle carte devra être délivrée en personne par l'association — votre carte virtuelle (QR) reste active entre-temps."
        confirmLabel="Déclarer la perte"
        variant="destructive"
        loading={declarerPerte.isPending}
        onConfirm={handleConfirmPerte}
      />
    </div>
  )
}
