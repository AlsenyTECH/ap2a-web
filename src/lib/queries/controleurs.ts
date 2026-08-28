import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { controleursApi } from '@/lib/api/controleurs'
import { apiErrorMessage } from '@/lib/api/client'

export const controleursKeys = {
  all: ['controleurs'] as const,
  monHistorique: ['controleurs', 'mon-historique'] as const,
}

export function useControleurs() {
  return useQuery({ queryKey: controleursKeys.all, queryFn: controleursApi.liste })
}

export function useModifierControleur() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Partial<{ zone_affectation: string; nom: string; prenom: string; email: string }>
    }) => controleursApi.modifier(id, payload),
    onSuccess: () => {
      toast.success('Contrôleur mis à jour')
      queryClient.invalidateQueries({ queryKey: controleursKeys.all })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useSupprimerControleur() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => controleursApi.supprimer(id),
    onSuccess: () => {
      toast.success('Contrôleur supprimé')
      queryClient.invalidateQueries({ queryKey: controleursKeys.all })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Suppression impossible')),
  })
}

export function useCreerControleur() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: controleursApi.creer,
    onSuccess: () => {
      toast.success('Contrôleur créé')
      queryClient.invalidateQueries({ queryKey: controleursKeys.all })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Création impossible')),
  })
}

export function useAssignerControleur() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, idEvenement }: { id: number; idEvenement: number }) =>
      controleursApi.assigner(id, idEvenement),
    onSuccess: () => {
      toast.success('Contrôleur assigné')
      queryClient.invalidateQueries({ queryKey: controleursKeys.all })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Assignation impossible')),
  })
}

export function useReinitialiserMotDePasseControleur() {
  return useMutation({
    mutationFn: (id: number) => controleursApi.reinitialiserMotDePasse(id),
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useMonHistoriqueControleur() {
  return useQuery({ queryKey: controleursKeys.monHistorique, queryFn: controleursApi.monHistorique })
}
