import { useState, useMemo } from 'react'
import {
  Award,
  IdCard,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  Printer,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'

import { useFormations, useCohortes, useParticipantsCohorte, useCohorteDetail } from '@/lib/queries/formations'
import { formationsApi } from '@/lib/api/formations'
import type { ParticipantCohorteListItem } from '@/lib/api/types'

export default function CertificatsKits() {
  // State for Selection & Filter
  const [selectedFormationId, setSelectedFormationId] = useState<number | null>(null)
  const [selectedCohorteId, setSelectedCohorteId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCertificat, setFilterCertificat] = useState<'ALL' | 'ELIGIBLE' | 'NON_ELIGIBLE'>('ALL')
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Download loading states
  const [downloadingBadges, setDownloadingBadges] = useState(false)
  const [downloadingCerts, setDownloadingCerts] = useState(false)
  const [inclurePhoto, setInclurePhoto] = useState(true)

  // Fetch Formations & Cohortes
  const { data: formations = [], isLoading: loadingFormations } = useFormations()

  // Select initial formation if available
  const activeFormationId = selectedFormationId ?? (formations.length > 0 ? formations[0].id_formation : null)

  const { data: cohortes = [], isLoading: loadingCohortes } = useCohortes(activeFormationId)

  // Select initial cohorte if available
  const activeCohorteId = selectedCohorteId ?? (cohortes.length > 0 ? cohortes[0].id_cohorte : null)

  const { data: cohorteDetail } = useCohorteDetail(activeCohorteId)
  const { data: participants = [], isLoading: loadingParticipants } = useParticipantsCohorte(activeCohorteId)

  // Filtered participants list
  const filteredParticipants = useMemo(() => {
    const seuil = cohorteDetail?.seuil_certification ?? 80
    return participants.filter((p) => {
      const matchSearch =
        `${p.prenom} ${p.nom} ${p.numero_badge || ''} ${p.telephone || ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())

      const isEligible = p.taux_presence >= seuil
      const matchCert =
        filterCertificat === 'ALL' ||
        (filterCertificat === 'ELIGIBLE' && isEligible) ||
        (filterCertificat === 'NON_ELIGIBLE' && !isEligible)

      return matchSearch && matchCert
    })
  }, [participants, searchQuery, filterCertificat, cohorteDetail?.seuil_certification])

  // Selection helpers
  const allSelected = filteredParticipants.length > 0 && selectedIds.length === filteredParticipants.length

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredParticipants.map((p) => p.id_participant))
    }
  }

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Action: Download Badges PDF (Batch or Selected)
  const handleDownloadBadges = async (onlySelected = false) => {
    if (!activeCohorteId) return
    const targetIds = onlySelected ? selectedIds : undefined
    if (onlySelected && selectedIds.length === 0) {
      toast.error('Veuillez sélectionner au moins un participant.')
      return
    }

    try {
      setDownloadingBadges(true)
      const blob = await formationsApi.telechargerBadgesCohortePdf(activeCohorteId, targetIds, inclurePhoto)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Badges_AP2A_${cohorteDetail?.code_cohorte || 'Session'}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Planche de badges PDF téléchargée avec succès !')
    } catch (err) {
      toast.error('Erreur lors de la génération des badges PDF.')
    } finally {
      setDownloadingBadges(false)
    }
  }

  // Action: Download Certificates PDF (Batch or Selected)
  const handleDownloadCertificats = async (onlySelected = false) => {
    if (!activeCohorteId) return
    const targetIds = onlySelected ? selectedIds : undefined
    if (onlySelected && selectedIds.length === 0) {
      toast.error('Veuillez sélectionner au moins un participant éligible.')
      return
    }

    try {
      setDownloadingCerts(true)
      const blob = await formationsApi.telechargerCertificatsLotPdf(activeCohorteId, targetIds)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Certificats_AP2A_${cohorteDetail?.code_cohorte || 'Session'}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Certificats officiels générés avec succès !')
    } catch (err) {
      toast.error('Erreur lors de la génération des certificats PDF.')
    } finally {
      setDownloadingCerts(false)
    }
  }

  // Action: Download Single Badge
  const handleDownloadSingleBadge = async (participant: ParticipantCohorteListItem) => {
    if (!activeCohorteId) return
    try {
      const blob = await formationsApi.telechargerBadgeParticipantPdf(
        activeCohorteId,
        participant.id_participant,
        inclurePhoto,
      )
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Badge_${participant.prenom}_${participant.nom}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(`Badge de ${participant.prenom} téléchargé.`)
    } catch {
      toast.error('Erreur lors du téléchargement du badge.')
    }
  }

  // Stats calculation
  const totalInscrits = participants.length
  const seuil = cohorteDetail?.seuil_certification ?? 80
  const eligibleCertificats = participants.filter((p) => p.taux_presence >= seuil).length

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Module Dédié & Logistique
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Certificats & Badges d'Accès
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl mt-1">
              Imprimez badges et certificats avec QR code sécurisé. La création et la distribution des kits
              pédagogiques se gèrent désormais dans « Kits Pédagogiques ».
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inclurePhoto}
                onChange={(e) => setInclurePhoto(e.target.checked)}
                className="size-4 rounded border-border accent-primary cursor-pointer"
              />
              Inclure la photo sur les badges
            </label>

            <button
              onClick={() => handleDownloadBadges(selectedIds.length > 0)}
              disabled={downloadingBadges || participants.length === 0}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              {downloadingBadges
                ? 'Génération...'
                : selectedIds.length > 0
                ? `Imprimer ${selectedIds.length} Badge(s)`
                : 'Imprimer Tous les Badges'}
            </button>

            <button
              onClick={() => handleDownloadCertificats(selectedIds.length > 0)}
              disabled={downloadingCerts || participants.length === 0}
              className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Award className="w-4 h-4 text-warning" />
              {downloadingCerts
                ? 'Génération...'
                : selectedIds.length > 0
                ? `Certificats (${selectedIds.length})`
                : 'Certificats du lot'}
            </button>
          </div>
        </div>
      </div>

      {/* Cohorte & Formation Selection Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            1. Sélectionner la Formation
          </label>
          <select
            value={activeFormationId ?? ''}
            onChange={(e) => {
              setSelectedFormationId(Number(e.target.value))
              setSelectedCohorteId(null)
              setSelectedIds([])
            }}
            className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground font-medium focus:ring-2 focus:ring-primary outline-hidden transition-colors"
          >
            {loadingFormations ? (
              <option>Chargement des formations...</option>
            ) : formations.length === 0 ? (
              <option>Aucune formation disponible</option>
            ) : (
              formations.map((f) => (
                <option key={f.id_formation} value={f.id_formation}>
                  {f.titre} ({f.nombre_cohortes} sessions)
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            2. Sélectionner la Cohorte / Session
          </label>
          <select
            value={activeCohorteId ?? ''}
            onChange={(e) => {
              setSelectedCohorteId(Number(e.target.value))
              setSelectedIds([])
            }}
            disabled={cohortes.length === 0}
            className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground font-medium focus:ring-2 focus:ring-primary outline-hidden disabled:opacity-50 transition-colors"
          >
            {loadingCohortes ? (
              <option>Chargement des cohortes...</option>
            ) : cohortes.length === 0 ? (
              <option>Aucune session pour cette formation</option>
            ) : (
              cohortes.map((c) => (
                <option key={c.id_cohorte} value={c.id_cohorte}>
                  Session {c.code_cohorte} — {c.statut} ({c.nombre_inscrits} inscrits)
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Cohorte Stats Banner */}
      {cohorteDetail && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-card border border-border flex flex-col justify-center text-center shadow-sm">
            <span className="text-xs text-muted-foreground font-medium">Inscrits</span>
            <span className="text-2xl font-bold text-foreground mt-1">{totalInscrits}</span>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border flex flex-col justify-center text-center shadow-sm">
            <span className="text-xs text-warning font-medium">Éligibles Certif.</span>
            <span className="text-2xl font-bold text-warning mt-1">
              {eligibleCertificats}
              <span className="text-xs font-normal text-muted-foreground">/{totalInscrits}</span>
            </span>
          </div>
        </div>
      )}

      {/* Main Table with Batch Selection and Filters */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom, N° badge..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-muted border border-border text-foreground focus:ring-2 focus:ring-primary outline-hidden"
              />
            </div>

            <select
              value={filterCertificat}
              onChange={(e) => setFilterCertificat(e.target.value as any)}
              className="text-xs font-medium px-3 py-2 rounded-lg bg-muted border border-border text-foreground outline-hidden"
            >
              <option value="ALL">Tous les certificats</option>
              <option value="ELIGIBLE">Éligibles (≥ {seuil}%)</option>
              <option value="NON_ELIGIBLE">Non éligibles</option>
            </select>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted border border-border animate-fade-in">
              <span className="text-xs font-bold text-foreground px-2">
                {selectedIds.length} sélectionné(s)
              </span>
            </div>
          )}
        </div>

        {/* Participants Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-muted/70 border-b border-border text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">
                  <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground">
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4">N° Badge d'Accès</th>
                <th className="py-3 px-4">Assiduité (% Présence)</th>
                <th className="py-3 px-4">Certificat Officiel</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {loadingParticipants ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    Chargement des participants de la session...
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    Aucun participant ne correspond aux critères.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p) => {
                  const isSelected = selectedIds.includes(p.id_participant)
                  const isEligible = p.taux_presence >= seuil

                  return (
                    <tr
                      key={p.id_participant}
                      className={`hover:bg-muted/40 transition-colors ${
                        isSelected ? 'bg-primary/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => toggleSelectOne(p.id_participant)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-primary" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-xs text-foreground">
                            {p.prenom[0]}
                            {p.nom[0]}
                          </div>
                          <div>
                            <span className="block font-semibold">
                              {p.prenom} {p.nom}
                            </span>
                            {p.telephone && <span className="text-xs text-muted-foreground">{p.telephone}</span>}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-foreground/80 font-semibold">
                        {p.numero_badge || `BADGE-${p.id_participant.toString().padStart(4, '0')}`}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold">{p.taux_presence.toFixed(0)}%</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                isEligible
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {isEligible ? 'Éligible' : `Requis ${seuil}%`}
                            </span>
                          </div>
                          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                p.taux_presence >= 90
                                  ? 'bg-primary'
                                  : p.taux_presence >= 75
                                  ? 'bg-primary/80'
                                  : p.taux_presence >= 50
                                  ? 'bg-warning'
                                  : 'bg-destructive'
                              }`}
                              style={{ width: `${Math.min(100, p.taux_presence)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {p.certificat_delivre ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-primary/20 text-primary">
                            <Award className="w-3.5 h-3.5" />
                            Délivré
                          </span>
                        ) : isEligible ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Prêt à éditer
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Présence insuffisante</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleDownloadSingleBadge(p)}
                            title="Télécharger le badge d'accès PDF"
                            className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
                          >
                            <IdCard className="w-4 h-4 text-primary" />
                          </button>

                          {isEligible && (
                            <button
                              onClick={() => handleDownloadCertificats(true)}
                              title="Télécharger le certificat individuel"
                              className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
                            >
                              <Award className="w-4 h-4 text-warning" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
