import { apiClient } from './client'
import type { HistoriqueParticipation, MonProfilMembre, StatutAdhesion } from './types'

/** Réponse d'une vérification de carte réussie (statique ou rotative). */
export interface CarteVerifiee {
  valide: true
  id_membre: number
  nom: string
  prenom: string
  numero_adherent: string
  photo: string | null
  /** Ticket à usage unique (~2 min) à renvoyer pour confirmer l'entrée. */
  ticket_scan: string
}

export const cartesApi = {
  /** Bloque uniquement la carte physique NFC ; la carte QR virtuelle n'est jamais affectée. */
  declarerPerte: () =>
    apiClient
      .post<{ carte_physique_bloquee: string }>('/carte/declarer-perte/')
      .then((r) => r.data),

  monProfil: () => apiClient.get<MonProfilMembre>('/membre/moi/').then((r) => r.data),

  qrActuel: () =>
    apiClient.get<{ contenu_carte: string }>('/membre/qr-actuel/').then((r) => r.data),

  historique: () =>
    apiClient.get<HistoriqueParticipation[]>('/membre/historique/').then((r) => r.data),

  verifierManuel: (numeroAdherent: string) =>
    apiClient
      .get<{
        trouve: boolean
        id_membre?: number
        nom?: string
        prenom?: string
        statut_adhesion?: StatutAdhesion
        photo?: string | null
        ticket_scan?: string
      }>(`/verifier-manuel/${numeroAdherent}/`)
      .then((r) => r.data),

  /**
   * `ticket_scan` : ticket à usage unique renvoyé par la vérification de la
   * carte (scan ou recherche manuelle) - c'est lui qui désigne le membre.
   */
  confirmerEntree: (payload: { ticket_scan: string; id_seance: number; methode_scan: 'QR' | 'NFC' | 'MANUEL' }) =>
    apiClient
      .post<{
        confirme: boolean
        membre: string
        evenement: string
        seance: number
        heure_arrivee: string
      }>('/confirmer-entree/', payload)
      .then((r) => r.data),

  /** Carte statique (3 segments scannés : uuid.version.signature). */
  verifier: (uuid: string, version: string, signature: string) =>
    apiClient
      .get<CarteVerifiee>(
        `/verifier/${uuid}/${version}/${signature}/`,
      )
      .then((r) => r.data),

  /** Carte virtuelle rotative (4 segments scannés : uuid.version.fenetre.signature). */
  verifierRotatif: (uuid: string, version: string, fenetre: string, signature: string) =>
    apiClient
      .get<CarteVerifiee>(
        `/verifier-rotatif/${uuid}/${version}/${fenetre}/${signature}/`,
      )
      .then((r) => r.data),
}

/**
 * Décode une chaîne scannée par la caméra (contenu d'un QR carte) et
 * appelle le bon endpoint de vérification selon son nombre de segments
 * (3 = statique/carte physique, 4 = rotatif/carte virtuelle - voir adhesion/utils.py
 * côté backend, `construire_contenu_carte`/`construire_contenu_rotatif`).
 */
export function verifierContenuScanne(contenu: string) {
  const segments = contenu.trim().split('.')
  if (segments.length === 3) {
    const [uuid, version, signature] = segments
    return cartesApi.verifier(uuid, version, signature)
  }
  if (segments.length === 4) {
    const [uuid, version, fenetre, signature] = segments
    return cartesApi.verifierRotatif(uuid, version, fenetre, signature)
  }
  return Promise.reject(new Error('QR non reconnu (format inattendu)'))
}
