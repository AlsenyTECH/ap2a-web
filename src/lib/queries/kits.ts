import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { kitsApi, type KitPayload } from '@/lib/api/kits'
import { apiErrorMessage } from '@/lib/api/client'

export const kitsKeys = {
  liste: (filtres?: { idFormation?: number; idCohorte?: number }) =>
    ['kits', 'liste', filtres?.idFormation ?? null, filtres?.idCohorte ?? null] as const,
}

export function useKits(filtres?: { idFormation?: number; idCohorte?: number }) {
  return useQuery({
    queryKey: kitsKeys.liste(filtres),
    queryFn: () => kitsApi.liste(filtres),
  })
}

export function useCreerKit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: KitPayload) => kitsApi.creer(payload),
    onSuccess: () => {
      toast.success('Kit créé')
      queryClient.invalidateQueries({ queryKey: ['kits'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Création impossible')),
  })
}

export function useModifierKit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idKit, payload }: { idKit: number; payload: Partial<KitPayload> }) =>
      kitsApi.modifier(idKit, payload),
    onSuccess: () => {
      toast.success('Kit mis à jour')
      queryClient.invalidateQueries({ queryKey: ['kits'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useSupprimerKit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idKit: number) => kitsApi.supprimer(idKit),
    onSuccess: () => {
      toast.success('Kit supprimé')
      queryClient.invalidateQueries({ queryKey: ['kits'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Suppression impossible')),
  })
}

export function useDistributionCohorte(idCohorte: number | null) {
  return useQuery({
    queryKey: ['kits', 'distribution', idCohorte ?? 0],
    queryFn: () => kitsApi.distributionCohorte(idCohorte as number),
    enabled: idCohorte !== null,
  })
}

export function useDistributionKit(idKit: number | null) {
  return useQuery({
    queryKey: ['kits', 'distribution-kit', idKit ?? 0],
    queryFn: () => kitsApi.distributionKit(idKit as number),
    enabled: idKit !== null,
  })
}

export function useBasculerDistribution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idKit, idParticipant }: { idKit: number; idParticipant: number }) =>
      kitsApi.basculerDistribution(idKit, idParticipant),
    onSuccess: () => {
      // Couvre à la fois la vue par cohorte et la vue par kit (préfixe commun 'kits').
      queryClient.invalidateQueries({ queryKey: ['kits'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}
