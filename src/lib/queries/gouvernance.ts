import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { gouvernanceApi, type CompteRenduPayload } from '@/lib/api/gouvernance'
import { apiErrorMessage } from '@/lib/api/client'

export function useComptesRendus() {
  return useQuery({
    queryKey: ['gouvernance', 'comptes-rendus'],
    queryFn: () => gouvernanceApi.liste(),
  })
}

export function useCompteRendu(idCompteRendu: number | null) {
  return useQuery({
    queryKey: ['gouvernance', 'comptes-rendus', idCompteRendu ?? 0],
    queryFn: () => gouvernanceApi.detail(idCompteRendu as number),
    enabled: idCompteRendu !== null,
  })
}

export function useCreerCompteRendu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CompteRenduPayload) => gouvernanceApi.creer(payload),
    onSuccess: () => {
      toast.success('Compte-rendu créé')
      queryClient.invalidateQueries({ queryKey: ['gouvernance'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Création impossible')),
  })
}

export function useModifierCompteRendu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idCompteRendu, payload }: { idCompteRendu: number; payload: Partial<CompteRenduPayload> }) =>
      gouvernanceApi.modifier(idCompteRendu, payload),
    onSuccess: () => {
      toast.success('Compte-rendu mis à jour')
      queryClient.invalidateQueries({ queryKey: ['gouvernance'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useSupprimerCompteRendu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idCompteRendu: number) => gouvernanceApi.supprimer(idCompteRendu),
    onSuccess: () => {
      toast.success('Compte-rendu supprimé')
      queryClient.invalidateQueries({ queryKey: ['gouvernance'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Suppression impossible')),
  })
}
