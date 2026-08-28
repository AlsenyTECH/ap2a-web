import { useState, type FormEvent } from 'react'
import { Loader2, Search, UserX } from 'lucide-react'
import {
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
import { useConfirmerEntree, useEvenements, useSeancesEvenement, useVerifierManuel } from '@/lib/queries'
import { formatDateTime } from '@/lib/utils/format'
import { ResultatVerification } from './controle-acces/ResultatVerification'
import { ScannerTab } from './controle-acces/ScannerTab'

type OngletControleAcces = 'scanner' | 'manuel'

export default function ControleAcces() {
  const [idEvenement, setIdEvenement] = useState<string | null>(null)
  const [idSeance, setIdSeance] = useState<string | null>(null)
  const [numero, setNumero] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchEnabled, setSearchEnabled] = useState(false)
  const [onglet, setOnglet] = useState<OngletControleAcces>('scanner')

  const { data: evenements, isLoading: evenementsLoading } = useEvenements()
  const { data: seances, isLoading: seancesLoading } = useSeancesEvenement(
    idEvenement ? Number(idEvenement) : null,
  )
  const verifier = useVerifierManuel(searchTerm, searchEnabled)
  const confirmerEntree = useConfirmerEntree()

  function handleEvenementChange(value: string) {
    setIdEvenement(value)
    setIdSeance(null)
  }

  function handleSubmitRecherche(e: FormEvent) {
    e.preventDefault()
    const trimmed = numero.trim()
    if (!trimmed) return
    setSearchTerm(trimmed)
    setSearchEnabled(true)
  }

  function handleConfirmerEntree() {
    if (!verifier.data?.id_membre || !idSeance) return
    confirmerEntree.mutate(
      { id_membre: verifier.data.id_membre, id_seance: Number(idSeance), methode_scan: 'MANUEL' },
      {
        onSuccess: () => {
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
        <h1 className="font-heading text-2xl font-semibold text-foreground">Contrôle d'accès</h1>
        <p className="text-sm text-muted-foreground">
          Scan caméra ou recherche manuelle pour enregistrer les entrées lorsque le scan QR/NFC n'est pas
          disponible.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={idEvenement ?? ''} onValueChange={handleEvenementChange} disabled={evenementsLoading}>
              <SelectTrigger className="sm:w-64">
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
            <Select value={idSeance ?? ''} onValueChange={setIdSeance} disabled={!idEvenement || seancesLoading}>
              <SelectTrigger className="sm:w-64">
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
          </div>
        </CardContent>
      </Card>

      <Tabs value={onglet} onValueChange={(v) => setOnglet(v as OngletControleAcces)}>
        <TabsList>
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="manuel">Recherche manuelle</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner">
          <ScannerTab idSeance={idSeance} />
        </TabsContent>

        <TabsContent value="manuel" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitRecherche} className="flex gap-2">
                <Input
                  placeholder="Numéro d'adhérent"
                  value={numero}
                  onChange={(e) => {
                    setNumero(e.target.value)
                    setSearchEnabled(false)
                  }}
                  className="max-w-xs"
                />
                <Button type="submit" disabled={!numero.trim()}>
                  <Search />
                  Rechercher
                </Button>
              </form>
            </CardContent>
          </Card>

          {searchEnabled &&
            (verifier.isFetching ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Recherche en cours…
                  </div>
                </CardContent>
              </Card>
            ) : verifier.isError ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-destructive">
                    <UserX className="size-5" />
                    <p className="text-sm font-medium">Membre introuvable</p>
                  </div>
                </CardContent>
              </Card>
            ) : verifier.data?.trouve ? (
              <ResultatVerification
                nom={verifier.data.nom ?? ''}
                prenom={verifier.data.prenom ?? ''}
                photo={verifier.data.photo}
                statutAdhesion={verifier.data.statut_adhesion}
                onConfirmer={handleConfirmerEntree}
                confirming={confirmerEntree.isPending}
                disabled={!idSeance}
              />
            ) : null)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
