import { apiClient, buildDownloadUrl } from './client'

export const certificatsApi = {
  certificatUrl: (idCohorte: number, idParticipant: number) =>
    buildDownloadUrl(`/cohorte/${idCohorte}/certificat/${idParticipant}/`),

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
