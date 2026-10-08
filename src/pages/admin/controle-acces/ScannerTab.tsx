import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, CameraOff, Loader2 } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import { useConfirmerEntree, useVerifierScan } from '@/lib/queries'
import { apiErrorMessage } from '@/lib/api/client'
import { ResultatVerification } from './ResultatVerification'

interface ScannerTabProps {
  idSeance: string | null
}

interface ScanPersonne {
  id_membre: number
  nom: string
  prenom: string
  photo: string | null
  numero_adherent: string
  ticket_scan: string
}

/** Id du conteneur caméra, distinct de celui du portail contrôleur pour éviter tout conflit. */
const QR_READER_ID = 'qr-reader-admin'

export function ScannerTab({ idSeance }: ScannerTabProps) {
  const [camActive, setCamActive] = useState(false)
  const [starting, setStarting] = useState(false)
  const [camError, setCamError] = useState<string | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [personne, setPersonne] = useState<ScanPersonne | null>(null)

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null)
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Empêche de traiter plusieurs lectures QR pendant qu'une vérification est déjà en cours. */
  const processingRef = useRef(false)

  const verifierScan = useVerifierScan()
  const confirmerEntree = useConfirmerEntree()

  async function stopCamera() {
    const instance = html5QrcodeRef.current
    html5QrcodeRef.current = null
    setCamActive(false)
    if (!instance) return
    try {
      if (instance.isScanning) {
        await instance.stop()
      }
      instance.clear()
    } catch {
      // caméra déjà arrêtée ou conteneur démonté : rien à faire
    }
  }

  function handleScanSuccess(decodedText: string) {
    if (processingRef.current) return
    processingRef.current = true
    setScanError(null)
    void stopCamera()
    verifierScan.mutate(decodedText, {
      onSuccess: (data) => {
        processingRef.current = false
        setPersonne({
          id_membre: data.id_membre,
          nom: data.nom,
          prenom: data.prenom,
          photo: data.photo,
          numero_adherent: data.numero_adherent,
          ticket_scan: data.ticket_scan,
        })
      },
      onError: (error) => {
        processingRef.current = false
        setScanError(apiErrorMessage(error, 'QR non reconnu ou invalide'))
      },
    })
  }

  async function startCamera() {
    if (html5QrcodeRef.current || starting) return
    setCamError(null)
    setScanError(null)
    setStarting(true)
    const instance = new Html5Qrcode(QR_READER_ID)
    html5QrcodeRef.current = instance
    try {
      await instance.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        handleScanSuccess,
        () => {
          // erreurs de lecture image par image (aucun QR détecté) : bruit normal, ignoré
        },
      )
      setCamActive(true)
    } catch {
      html5QrcodeRef.current = null
      setCamActive(false)
      setCamError("Impossible d'accéder à la caméra. Vérifiez les autorisations du navigateur.")
    } finally {
      setStarting(false)
    }
  }

  function handleConfirmerEntree() {
    if (!personne || !idSeance) return
    confirmerEntree.mutate(
      { ticket_scan: personne.ticket_scan, id_seance: Number(idSeance), methode_scan: 'QR' },
      {
        onSuccess: () => {
          setPersonne(null)
          // relance automatiquement le scanner pour la personne suivante
          restartTimeoutRef.current = setTimeout(() => {
            void startCamera()
          }, 2000)
        },
      },
    )
  }

  // Nettoyage de la caméra au démontage du composant (y compris lors d'un
  // changement d'onglet, qui démonte ce composant via Radix Tabs).
  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current)
      void stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-6">
          {!idSeance && (
            <p className="text-sm text-muted-foreground">
              Sélectionnez un événement et une séance pour pouvoir confirmer une entrée scannée.
            </p>
          )}

          <div
            id={QR_READER_ID}
            className={camActive ? 'mx-auto w-full max-w-sm overflow-hidden rounded-md' : 'hidden'}
          />

          {camActive ? (
            <Button type="button" variant="outline" onClick={() => void stopCamera()}>
              <CameraOff />
              Arrêter le scan
            </Button>
          ) : (
            <Button type="button" onClick={() => void startCamera()} disabled={starting}>
              {starting ? <Loader2 className="animate-spin" /> : <Camera />}
              Démarrer le scan
            </Button>
          )}

          {camError && <p className="text-sm text-destructive">{camError}</p>}
        </CardContent>
      </Card>

      {(verifierScan.isPending || scanError) && (
        <Card>
          <CardContent className="pt-6">
            {verifierScan.isPending ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Vérification du QR…
              </div>
            ) : (
              <p className="text-sm font-medium text-destructive">{scanError}</p>
            )}
          </CardContent>
        </Card>
      )}

      {personne && (
        <ResultatVerification
          nom={personne.nom}
          prenom={personne.prenom}
          photo={personne.photo}
          numeroAdherent={personne.numero_adherent}
          onConfirmer={handleConfirmerEntree}
          confirming={confirmerEntree.isPending}
          disabled={!idSeance}
        />
      )}
    </div>
  )
}
