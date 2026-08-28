import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Award, Gift, UserPlus, Upload, Users, Plus, Pencil, Trash2, Calendar, MapPin, UserX,
  Rocket, FlagOff, Ban, Lock, IdCard, Package, Loader2, PackageCheck,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
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
import { ExcelImportModal } from '@/components/shared/ExcelImportModal'
import {
  useActerProgrammeCohorte,
  useBasculerDistribution,
  useChangerStatutCohorte,
  useCohorteDetail,
  useDistributionCohorte,
  useImporterParticipantsExcel,
  useParticipantsCohorte,
  useRetirerParticipantCohorte,
  useSeancesCohorte,
  useSupprimerCohorte,
  useSupprimerSeanceCohorte,
  useTerminerCohorte,
} from '@/lib/queries'
import { formationsApi } from '@/lib/api/formations'
import { formatDate, formatDateTime, formatMoney } from '@/lib/utils/format'
import { statutCohorteMeta } from '@/lib/utils/status'
import { cn } from '@/lib/utils'
import type { ParticipantCohorteListItem, SeanceCohorte } from '@/lib/api/types'
import { AjouterParticipantDialog } from './AjouterParticipantDialog'
import { EditParticipantDialog } from './EditParticipantDialog'
import { SeanceCohorteDialog } from './SeanceCohorteDialog'

interface CohorteDetailPanelProps {
  idCohorte: number
  codeCohorte: string
}

export function CohorteDetailPanel({ idCohorte, codeCohorte }: CohorteDetailPanelProps) {
  const [participantOpen, setParticipantOpen] = useState(false)
  const [participantToEdit, setParticipantToEdit] = useState<ParticipantCohorteListItem | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [seanceDialogOpen, setSeanceDialogOpen] = useState(false)
  const [seanceToEdit, setSeanceToEdit] = useState<SeanceCohorte | null>(null)
  const [seanceToDelete, setSeanceToDelete] = useState<SeanceCohorte | null>(null)
  const [participantToRemove, setParticipantToRemove] = useState<{ idInscription: number; nom: string } | null>(null)
  const [supprimerCohorteOpen, setSupprimerCohorteOpen] = useState(false)
  const [annulerCohorteOpen, setAnnulerCohorteOpen] = useState(false)
  const [downloadingCerts, setDownloadingCerts] = useState(false)

  const cohorte = useCohorteDetail(idCohorte)
  const seances = useSeancesCohorte(idCohorte)
  const participants = useParticipantsCohorte(idCohorte)
  const changerStatut = useChangerStatutCohorte()
  const acterProgramme = useActerProgrammeCohorte()
  const terminerCohorte = useTerminerCohorte()
  const importerExcel = useImporterParticipantsExcel()
  const supprimerSeance = useSupprimerSeanceCohorte()
  const retirerParticipant = useRetirerParticipantCohorte()
  const supprimerCohorte = useSupprimerCohorte()

  const seuil = cohorte.data?.seuil_certification ?? 75
  const statut = cohorte.data?.statut
  const verrouillee = cohorte.data?.verrouillee ?? false
  const peutSupprimer = statut !== 'EN_COURS' && statut !== 'TERMINEE'
  const peutAnnuler = statut === 'BROUILLON' || statut === 'PROGRAMMEE'
  const estTerminee = statut === 'TERMINEE'

  const distribution = useDistributionCohorte(estTerminee ? idCohorte : null)
  const basculerDistribution = useBasculerDistribution()

  async function handleDownloadCertificats() {
    try {
      setDownloadingCerts(true)
      const blob = await formationsApi.telechargerCertificatsLotPdf(idCohorte)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Certificats_AP2A_${codeCohorte}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Certificats générés avec succès !')
    } catch {
      toast.error('Erreur lors de la génération des certificats.')
    } finally {
      setDownloadingCerts(false)
    }
  }

  function handleAddSeance() {
    setSeanceToEdit(null)
    setSeanceDialogOpen(true)
  }

  function handleEditSeance(s: SeanceCohorte) {
    setSeanceToEdit(s)
    setSeanceDialogOpen(true)
  }

  async function handleDeleteSeance() {
    if (!seanceToDelete) return
    await supprimerSeance.mutateAsync({
      idSeanceCohorte: seanceToDelete.id_seance_cohorte,
      idCohorte,
    })
    setSeanceToDelete(null)
  }

  async function handleRemoveParticipant() {
    if (!participantToRemove) return
    await retirerParticipant.mutateAsync({
      idInscription: participantToRemove.idInscription,
      idCohorte,
    })
    setParticipantToRemove(null)
  }

  async function handleDeleteCohorte() {
    await supprimerCohorte.mutateAsync(idCohorte)
    setSupprimerCohorteOpen(false)
  }

  async function handleAnnulerCohorte() {
    await changerStatut.mutateAsync({ idCohorte, statut: 'ANNULEE' })
    setAnnulerCohorteOpen(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{codeCohorte}</CardTitle>
              {cohorte.data?.lieu && (
                <Badge variant="outline" className="gap-1">
                  <MapPin className="size-3" />
                  {cohorte.data.lieu}
                </Badge>
              )}
              {statut && (
                <Badge variant={statutCohorteMeta(statut).variant}>{statutCohorteMeta(statut).label}</Badge>
              )}
            </div>
            {cohorte.data?.formateur && (
              <p className="text-xs text-muted-foreground mt-1">Formateur : {cohorte.data.formateur}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {statut === 'BROUILLON' && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                disabled={acterProgramme.isPending}
                onClick={() => acterProgramme.mutate(idCohorte)}
              >
                <Rocket className="size-3.5 mr-1" />
                {acterProgramme.isPending ? 'Lancement...' : 'Lancer la formation'}
              </Button>
            )}

            {statut === 'EN_COURS' && (
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90"
                disabled={terminerCohorte.isPending}
                onClick={() => terminerCohorte.mutate(idCohorte)}
              >
                <FlagOff className="size-3.5 mr-1" />
                {terminerCohorte.isPending ? 'Clôture...' : 'Terminer'}
              </Button>
            )}

            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/certificats-kits">
                <IdCard className="size-3.5 mr-1 text-emerald-600" />
                Badges & Certificats
              </Link>
            </Button>

            {peutAnnuler && (
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setAnnulerCohorteOpen(true)}>
                <Ban className="size-3.5 mr-1" />
                Annuler
              </Button>
            )}

            {peutSupprimer && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setSupprimerCohorteOpen(true)}
              >
                <Trash2 className="size-3.5 mr-1" />
                Supprimer
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {verrouillee && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <Lock className="size-3.5 shrink-0" />
          Cette cohorte est {statut === 'TERMINEE' ? 'terminée' : 'annulée'} : plus aucune modification n'est possible
          (participants, séances, informations).
        </div>
      )}

      <Tabs defaultValue="apercu">
        <TabsList>
          <TabsTrigger value="apercu">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="seances">Séances & Planning</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          {estTerminee && <TabsTrigger value="distribution">Distribution</TabsTrigger>}
        </TabsList>

        <TabsContent value="apercu">
          {cohorte.isLoading && <Skeleton className="h-48 w-full" />}
          {!cohorte.isLoading && cohorte.data && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatTile label="Taux d'assiduité" value={`${cohorte.data.taux_assiduite}%`} />
                <StatTile label="Séances" value={cohorte.data.nombre_seances} />
                <StatTile label="Participants" value={cohorte.data.nombre_participants} />
                <StatTile
                  label="Capacité"
                  value={`${cohorte.data.capacite_min ?? '—'} / ${cohorte.data.capacite_max ?? '—'}`}
                />
                {cohorte.data.est_payante ? (
                  <>
                    <StatTile label="Prix" value={formatMoney(cohorte.data.prix)} />
                    <StatTile label="Prix adhérent" value={formatMoney(cohorte.data.prix_adherent)} />
                  </>
                ) : (
                  <div className="col-span-2 flex flex-col items-start justify-center gap-1 rounded-lg border border-success/40 bg-success/10 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tarification</p>
                    <Badge variant="success" className="gap-1">
                      <Gift className="size-3" />
                      Gratuite
                    </Badge>
                  </div>
                )}
                <StatTile label="Financeur" value={cohorte.data.financeur ?? '—'} />
                <StatTile label="Convention n°" value={cohorte.data.numero_convention ?? '—'} />
                <StatTile
                  label="Public cible"
                  value={cohorte.data.public_cible_type === 'SPECIFIQUE' ? 'Sélection de membres' : 'Tous les membres'}
                />
              </div>

              {Object.keys(cohorte.data.presence_par_seance).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Présence par séance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    {Object.entries(cohorte.data.presence_par_seance).map(([seance, nombre]) => {
                      const max = Math.max(1, cohorte.data!.nombre_participants)
                      const pct = Math.min(100, Math.round((nombre / max) * 100))
                      return (
                        <div key={seance} className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{seance}</span>
                            <span>{nombre} présent(s)</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="seances">
          {!verrouillee && (
            <div className="mb-3 flex justify-end gap-2">
              <Button size="sm" onClick={handleAddSeance}>
                <Plus className="size-4 mr-1" />
                Ajouter une séance
              </Button>
            </div>
          )}

          {seances.isLoading && <Skeleton className="h-48 w-full" />}
          {!seances.isLoading && (!seances.data || seances.data.length === 0) && (
            <EmptyState icon={Calendar} title="Aucune séance" description="Planifiez les séances de cours, TD, TP ou examens." />
          )}
          {!seances.isLoading && seances.data && seances.data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">N°</TableHead>
                  <TableHead>Titre / Sujet</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date & Heure</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead>Formateur</TableHead>
                  {!verrouillee && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {seances.data.map((s) => (
                  <TableRow key={s.id_seance_cohorte}>
                    <TableCell className="font-semibold">{s.numero_ordre}</TableCell>
                    <TableCell className="font-medium">{s.titre_seance || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{s.type_seance}</Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(s.date_seance)}</TableCell>
                    <TableCell>{s.lieu || '—'}</TableCell>
                    <TableCell>{s.formateur_seance || '—'}</TableCell>
                    {!verrouillee && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => handleEditSeance(s)}
                            title="Modifier la séance"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive hover:bg-destructive/10"
                            onClick={() => setSeanceToDelete(s)}
                            title="Supprimer la séance"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="participants">
          {!verrouillee && (
            <div className="mb-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                <Upload className="size-4" />
                Importer Excel
              </Button>
              <Button size="sm" onClick={() => setParticipantOpen(true)}>
                <UserPlus className="size-4" />
                Ajouter un participant
              </Button>
            </div>
          )}

          {participants.isLoading && <Skeleton className="h-48 w-full" />}
          {!participants.isLoading && (!participants.data || participants.data.length === 0) && (
            <EmptyState icon={Users} title="Aucun participant" description="Ajoutez ou importez des participants pour cette cohorte." />
          )}
          {!participants.isLoading && participants.data && participants.data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Prénom</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Présence</TableHead>
                  {!verrouillee && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.data.map((p) => {
                  const certifiable = p.taux_presence >= seuil
                  return (
                    <TableRow key={p.id_inscription}>
                      <TableCell className="font-medium">{p.nom}</TableCell>
                      <TableCell>{p.prenom}</TableCell>
                      <TableCell>{p.numero_badge}</TableCell>
                      <TableCell>{p.statut}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-muted">
                            <div
                              className={cn('h-2 rounded-full', certifiable ? 'bg-success' : 'bg-warning')}
                              style={{ width: `${Math.min(100, p.taux_presence)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{p.taux_presence}%</span>
                          {certifiable && (
                            <Badge variant="success" className="gap-1">
                              <Award className="size-3" />
                              Certifiable
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      {!verrouillee && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => setParticipantToEdit(p)}
                              title="Modifier le participant"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-destructive hover:bg-destructive/10"
                              onClick={() => setParticipantToRemove({ idInscription: p.id_inscription, nom: `${p.prenom} ${p.nom}` })}
                              title="Retirer de la cohorte"
                            >
                              <UserX className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {estTerminee && (
          <TabsContent value="distribution">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Contrôlez qui a reçu son kit et générez les certificats officiels de cette session.
              </p>
              <Button size="sm" variant="outline" onClick={handleDownloadCertificats} disabled={downloadingCerts}>
                {downloadingCerts ? <Loader2 className="size-4 animate-spin" /> : <Award className="size-4 text-warning" />}
                Certificats de la session
              </Button>
            </div>

            {distribution.isLoading && <Skeleton className="h-48 w-full" />}
            {!distribution.isLoading && (!distribution.data || distribution.data.length === 0) && (
              <EmptyState
                icon={Package}
                title="Aucun kit à distribuer"
                description="Aucun kit n'a été configuré pour cette formation, cette cohorte, ou ses participants."
                action={
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/admin/kits">
                      <Plus className="size-4 mr-1" />
                      Configurer un kit
                    </Link>
                  </Button>
                }
              />
            )}
            {!distribution.isLoading && distribution.data && distribution.data.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Kit</TableHead>
                    <TableHead>Remise</TableHead>
                    <TableHead>Remis par / le</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {distribution.data.map((d) => (
                    <TableRow key={`${d.id_kit}-${d.id_participant}`}>
                      <TableCell className="font-medium">{d.prenom} {d.nom}</TableCell>
                      <TableCell>{d.nom_kit}</TableCell>
                      <TableCell>
                        <button
                          type="button"
                          disabled={basculerDistribution.isPending}
                          onClick={() =>
                            basculerDistribution.mutate({ idKit: d.id_kit, idParticipant: d.id_participant })
                          }
                          className="disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Badge variant={d.distribue ? 'success' : 'outline'} className="cursor-pointer gap-1">
                            {d.distribue ? <PackageCheck className="size-3" /> : <Package className="size-3" />}
                            {d.distribue ? 'Remis' : 'Non remis'}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {d.distribue && d.remis_par ? `${d.remis_par}` : '—'}
                        {d.distribue && d.date_distribution && ` · ${formatDate(d.date_distribution)}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        )}
      </Tabs>

      <AjouterParticipantDialog open={participantOpen} onOpenChange={setParticipantOpen} idCohorte={idCohorte} />

      <EditParticipantDialog
        participant={participantToEdit}
        idCohorte={idCohorte}
        open={Boolean(participantToEdit)}
        onOpenChange={(open) => !open && setParticipantToEdit(null)}
      />

      <SeanceCohorteDialog
        open={seanceDialogOpen}
        onOpenChange={setSeanceDialogOpen}
        idCohorte={idCohorte}
        seanceToEdit={seanceToEdit}
      />

      <ExcelImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Importer des participants"
        instructions="Le fichier Excel doit contenir les colonnes nom, prenom, telephone (optionnel) et numero_carte_identite (optionnel)."
        onImport={(fichier) => importerExcel.mutateAsync({ idCohorte, fichier })}
        renderResult={(result) => (
          <div className="space-y-1">
            <p>{result.nouveaux} nouveau(x) participant(s)</p>
            <p>{result.reconnus} participant(s) reconnu(s)</p>
            <p>{result.ignores} ligne(s) ignorée(s)</p>
          </div>
        )}
      />

      <ConfirmDialog
        open={!!seanceToDelete}
        onOpenChange={(op) => !op && setSeanceToDelete(null)}
        title="Supprimer la séance"
        description={`Êtes-vous sûr de vouloir supprimer la séance n°${seanceToDelete?.numero_ordre} ? Cette action n'est possible que si aucune présence n'a été enregistrée.`}
        confirmLabel="Supprimer"
        variant="destructive"
        loading={supprimerSeance.isPending}
        onConfirm={handleDeleteSeance}
      />

      <ConfirmDialog
        open={!!participantToRemove}
        onOpenChange={(op) => !op && setParticipantToRemove(null)}
        title="Retirer le participant"
        description={`Voulez-vous retirer ${participantToRemove?.nom} de cette cohorte ?`}
        confirmLabel="Retirer"
        variant="destructive"
        loading={retirerParticipant.isPending}
        onConfirm={handleRemoveParticipant}
      />

      <ConfirmDialog
        open={supprimerCohorteOpen}
        onOpenChange={setSupprimerCohorteOpen}
        title="Supprimer la cohorte"
        description="Êtes-vous sûr de vouloir supprimer cette cohorte ? Toutes les séances et inscriptions associées seront supprimées."
        confirmLabel="Supprimer définitivement"
        variant="destructive"
        loading={supprimerCohorte.isPending}
        onConfirm={handleDeleteCohorte}
      />

      <ConfirmDialog
        open={annulerCohorteOpen}
        onOpenChange={setAnnulerCohorteOpen}
        title="Annuler la cohorte"
        description="La cohorte sera marquée comme annulée. Elle restera consultable mais ne pourra plus être modifiée."
        confirmLabel="Annuler la cohorte"
        variant="destructive"
        loading={changerStatut.isPending}
        onConfirm={handleAnnulerCohorte}
      />
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    </div>
  )
}
