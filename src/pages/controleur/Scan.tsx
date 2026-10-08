import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, CameraOff, Loader2, ScanLine, Search, UserX } from 'lucide-react'
import { toast } from 'sonner'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import {
  useConfirmerEntree,
  useEvenements,
  useSeancesEvenement,
  useVerifierManuel,
  useVerifierScan,
} from '@/lib/queries'
import { apiErrorMessage, mediaUrl } from '@/lib/api/client'
import { formatDateTime, initials } from '@/lib/utils/format'
import { statutAdhesionMeta } from '@/lib/utils/status'

const QR_READER_ID = 'qr-reader'

interface CarteVerifiee {
  id_membre: number
  nom: string
  prenom: string
  numero_adherent: string
  photo: string | null
  ticket_scan: string
}

type ScanPhase = 'idle' | 'starting' | 'active' | 'verifying' | 'result'

export default function Scan() {
  const [idEvenement, setIdEvenement] = useState<string | null>(null)
  const [idSeance, setIdSeance] = useState<string | null>(null)
  const [tab, setTab] = useState('scanner')

  // -- Onglet Scanner --
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [phase, setPhase] = useState<ScanPhase>('idle')
  const [scanResult, setScanResult] = useState<CarteVerifiee | null>(null)

  // -- Onglet Recherche manuelle --
  const [numero, setNumero] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchEnabled, setSearchEnabled] = useState(false)

  const { data: evenements, isLoading: evenementsLoading } = useEvenements()
  const { data: seances, isLoading: seancesLoading } = useSeancesEvenement(
    idEvenement ? Number(idEvenement) : null,
  )
  const verifierScan = useVerifierScan()
  const verifierManuel = useVerifierManuel(searchTerm, searchEnabled)
  const confirmerEntree = useConfirmerEntree()

  // Coupe proprement la caméra au démontage du composant (évite une fuite de flux vidéo).
  useEffect(() => {
    return () => {
      const instance = scannerRef.current
      if (instance && instance.isScanning) {
        instance.stop().catch(() => {})
      }
    }
  }, [])

  async function stopCamera() {
    const instance = scannerRef.current
    if (instance && instance.isScanning) {
      try {
        await instance.stop()
      } catch {
        // caméra déjà arrêtée ou élément démonté entre-temps : sans conséquence
      }
    }
  }

  async function startScanner() {
    if (!idSeance) {
      toast.error('Choisissez un événement et une séance avant de scanner')
      return
    }
    setScanResult(null)
    setPhase('starting')
    try {
      const instance = scannerRef.current ?? new Html5Qrcode(QR_READER_ID)
      scannerRef.current = instance
      await instance.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        handleScanSuccess,
        () => {
          // erreurs de décodage image par image : ignorées (pas de QR dans le cadre)
        },
      )
      setPhase('active')
    } catch {
      toast.error("Impossible d'accéder à la caméra")
      setPhase('idle')
    }
  }

  function handleStopClick() {
    void stopCamera()
    setPhase('idle')
  }

  function handleScanSuccess(decodedText: string) {
    setPhase('verifying')
    void stopCamera()
    verifierScan.mutate(decodedText, {
      onSuccess: (data) => {
        setScanResult({
          id_membre: data.id_membre,
          nom: data.nom,
          prenom: data.prenom,
          numero_adherent: data.numero_adherent,
          photo: data.photo,
          ticket_scan: data.ticket_scan,
        })
        setPhase('result')
        toast.success('Carte reconnue')
      },
      onError: (error) => {
        toast.error(apiErrorMessage(error, 'Carte invalide'))
        void startScanner()
      },
    })
  }

  function handleConfirmerEntreeScan() {
    if (!scanResult || !idSeance) return
    confirmerEntree.mutate(
      { ticket_scan: scanResult.ticket_scan, id_seance: Number(idSeance), methode_scan: 'QR' },
      {
        onSuccess: () => {
          toast.success('Entrée confirmée')
          setScanResult(null)
          setPhase('idle')
          setTimeout(() => {
            void startScanner()
          }, 2000)
        },
      },
    )
  }

  function handleEvenementChange(value: string) {
    void stopCamera()
    setPhase('idle')
    setScanResult(null)
    setIdEvenement(value)
    setIdSeance(null)
  }

  function handleSeanceChange(value: string) {
    void stopCamera()
    setPhase('idle')
    setScanResult(null)
    setIdSeance(value)
  }

  function handleTabChange(value: string) {
    if (tab === 'scanner' && value !== 'scanner') {
      void stopCamera()
      setPhase('idle')
    }
    setTab(value)
  }

  function handleSubmitRecherche(e: FormEvent) {
    e.preventDefault()
    const trimmed = numero.trim()
    if (!trimmed) return
    setSearchTerm(trimmed)
    setSearchEnabled(true)
  }

  function handleConfirmerEntreeManuel() {
    if (!verifierManuel.data?.ticket_scan || !idSeance) return
    confirmerEntree.mutate(
      { ticket_scan: verifierManuel.data.ticket_scan, id_seance: Number(idSeance), methode_scan: 'MANUEL' },
      {
        onSuccess: () => {
          toast.success('Entrée confirmée')
          setNumero('')
          setSearchTerm('')
          setSearchEnabled(false)
        },
      },
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Scanner</h1>
        <p className="text-sm text-muted-foreground">
          Contrôlez les entrées à l'aide de la caméra ou en recherche manuelle.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <Select value={idEvenement ?? ''} onValueChange={handleEvenementChange} disabled={evenementsLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un événement" />
            </SelectTrigger>
            <SelectContent>
              {evenements?.map((evt) => (
                <SelectItem key={evt.id_evenement} value={String(evt.id_evenement)}>
                  {evt.titre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={idSeance ?? ''}
            onValueChange={handleSeanceChange}
            disabled={!idEvenement || seancesLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir une séance" />
            </SelectTrigger>
            <SelectContent>
              {seances?.map((seance) => (
                <SelectItem key={seance.id_seance} value={String(seance.id_seance)}>
                  Séance {seance.numero_ordre} · {formatDateTime(seance.date_seance)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="manuel">Recherche manuelle</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div id={QR_READER_ID} className="mx-auto w-full max-w-sm overflow-hidden rounded-lg" />

              {phase === 'idle' && (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Camera className="size-8" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Démarrez la caméra pour scanner la carte d'un membre.
                  </p>
                  <Button size="lg" onClick={() => void startScanner()} disabled={!idSeance}>
                    <Camera />
                    Démarrer le scan
                  </Button>
                  {!idSeance && (
                    <p className="text-xs text-muted-foreground">
                      Choisissez d'abord un événement et une séance.
                    </p>
                  )}
                </div>
              )}

              {phase === 'starting' && (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Démarrage de la caméra…</p>
                </div>
              )}

              {phase === 'active' && (
                <div className="flex flex-col items-center gap-3 text-center">
                  <p className="text-sm text-muted-foreground">Visez le QR code de la carte membre.</p>
                  <Button variant="outline" onClick={handleStopClick}>
                    <CameraOff />
                    Arrêter
                  </Button>
                </div>
              )}

              {phase === 'verifying' && (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Vérification…</p>
                </div>
              )}

              {phase === 'result' && scanResult && (
                <div className="flex flex-col items-center gap-4 rounded-lg border border-success/40 bg-success/10 p-4 text-center">
                  <Avatar className="size-16">
                    {scanResult.photo ? <AvatarImage src={mediaUrl(scanResult.photo)} /> : null}
                    <AvatarFallback>{initials(scanResult.nom, scanResult.prenom)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-heading text-lg font-semibold text-foreground">
                      {scanResult.prenom} {scanResult.nom}
                    </p>
                    <p className="text-sm text-muted-foreground">N° {scanResult.numero_adherent}</p>
                  </div>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleConfirmerEntreeScan}
                    disabled={confirmerEntree.isPending}
                  >
                    {confirmerEntree.isPending ? <Loader2 className="animate-spin" /> : <ScanLine />}
                    Confirmer l'entrée
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manuel" className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <form onSubmit={handleSubmitRecherche} className="flex gap-2">
                <Input
                  placeholder="Numéro d'adhérent"
                  value={numero}
                  onChange={(e) => {
                    setNumero(e.target.value)
                    setSearchEnabled(false)
                  }}
                />
                <Button type="submit" disabled={!numero.trim()}>
                  <Search />
                  Rechercher
                </Button>
              </form>

              {searchEnabled && (
                <div>
                  {verifierManuel.isFetching ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      Recherche en cours…
                    </div>
                  ) : verifierManuel.isError ? (
                    <div className="flex items-center gap-3 text-destructive">
                      <UserX className="size-5" />
                      <p className="text-sm font-medium">Membre introuvable</p>
                    </div>
                  ) : verifierManuel.data?.trouve ? (
                    <div className="flex flex-col items-center gap-4 rounded-lg border border-border p-4 text-center">
                      <Avatar className="size-16">
                        {verifierManuel.data.photo ? (
                          <AvatarImage src={mediaUrl(verifierManuel.data.photo)} />
                        ) : null}
                        <AvatarFallback>
                          {initials(verifierManuel.data.nom ?? '', verifierManuel.data.prenom ?? '')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-heading text-lg font-semibold text-foreground">
                          {verifierManuel.data.prenom} {verifierManuel.data.nom}
                        </p>
                        {verifierManuel.data.statut_adhesion && (
                          <Badge variant={statutAdhesionMeta(verifierManuel.data.statut_adhesion).variant}>
                            {statutAdhesionMeta(verifierManuel.data.statut_adhesion).label}
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={handleConfirmerEntreeManuel}
                        disabled={!idSeance || confirmerEntree.isPending}
                      >
                        {confirmerEntree.isPending ? <Loader2 className="animate-spin" /> : <ScanLine />}
                        Confirmer l'entrée
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
