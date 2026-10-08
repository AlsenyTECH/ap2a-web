import { apiClient, openDownload } from './client'

export const certificatsApi = {
  telechargerCertificat: (idCohorte: number, idParticipant: number) =>
    openDownload(`/cohorte/${idCohorte}/certificat/${idParticipant}/`),

  verifierCertificat: (numeroCertificat: string) =>
    apiClient
      .get<{
        valide: boolean
        numero_certificat?: string
        participant?: string
        formation?: string
        cohorte?: string
        date_debut?: string
        date_fin?: string
        association?: string
      }>(`/public/verifier-certificat/${numeroCertificat}/`)
      .then((r) => r.data),
}
