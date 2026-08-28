import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cartesApi, verifierContenuScanne } from '@/lib/api/cartes'
import { apiErrorMessage } from '@/lib/api/client'

export const cartesKeys = {
  monProfil: ['cartes', 'mon-profil'] as const,
  qrActuel: ['cartes', 'qr-actuel'] as const,
  historique: ['cartes', 'historique'] as const,
  verifierManuel: (numero: string) => ['cartes', 'verifier-manuel', numero] as const,
}

export function useMonProfilMembre() {
  return useQuery({ queryKey: cartesKeys.monProfil, queryFn: cartesApi.monProfil })
}

/** QR rotatif : régénéré côté backend à chaque appel, on le rafraîchit toutes les 10s. */
export function useQrActuel(enabled = true) {
  return useQuery({
    queryKey: cartesKeys.qrActuel,
    queryFn: cartesApi.qrActuel,
    enabled,
    refetchInterval: enabled ? 10_000 : false,
    staleTime: 0,
  })
}

export function useHistoriqueParticipation() {
  return useQuery({ queryKey: cartesKeys.historique, queryFn: cartesApi.historique })
}

export function useVerifierManuel(numeroAdherent: string, enabled: boolean) {
  return useQuery({
    queryKey: cartesKeys.verifierManuel(numeroAdherent),
    queryFn: () => cartesApi.verifierManuel(numeroAdherent),
    enabled: enabled && numeroAdherent.trim().length > 0,
    retry: false,
  })
}

export function useDeclarerPerte() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cartesApi.declarerPerte,
    onSuccess: () => {
      toast.success('Carte physique bloquée — contactez l’association pour son remplacement')
      queryClient.invalidateQueries({ queryKey: cartesKeys.monProfil })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Impossible de déclarer la perte')),
  })
}

export function useConfirmerEntree() {
  return useMutation({
    mutationFn: cartesApi.confirmerEntree,
    onError: (error) => toast.error(apiErrorMessage(error, 'Confirmation impossible')),
  })
}

/** Vérifie un contenu de QR scanné à la caméra (statique ou rotatif). */
export function useVerifierScan() {
  return useMutation({
    mutationFn: (contenu: string) => verifierContenuScanne(contenu),
  })
}
