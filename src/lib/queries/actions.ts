import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/lib/api/client'
import { actionsApi, type FiltresActions } from '@/lib/api/actions'
import type { ActionFiche } from '@/lib/api/types'

export const actionsKeys = {
  liste: (filtres: FiltresActions) => ['actions', 'liste', filtres] as const,
  fiche: (id: number) => ['actions', 'fiche', id] as const,
  besoins: (params: object) => ['actions', 'besoins', params] as const,
  calendrier: (debut: string, fin: string) => ['actions', 'calendrier', debut, fin] as const,
  mes: ['actions', 'mes'] as const,
}

export function useActions(filtres: FiltresActions) {
  return useQuery({
    queryKey: actionsKeys.liste(filtres),
    queryFn: () => actionsApi.liste(filtres),
    placeholderData: keepPreviousData,
  })
}

export function useFicheAction(id: number | null) {
  return useQuery({
    queryKey: actionsKeys.fiche(id ?? 0),
    queryFn: () => actionsApi.fiche(id as number),
    enabled: id !== null,
  })
}

/**
 * Mutation sur une action : la fiche renvoyée par l'API remplace directement
 * le cache (pas de rechargement), et les listes sont rafraîchies.
 */
export function useMutationFiche<TVariables>(
  idAction: number,
  mutationFn: (variables: TVariables) => Promise<ActionFiche>,
  succes?: string,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (fiche) => {
      queryClient.setQueryData(actionsKeys.fiche(idAction), fiche)
      queryClient.invalidateQueries({ queryKey: ['actions', 'liste'] })
      queryClient.invalidateQueries({ queryKey: ['actions', 'besoins'] })
      queryClient.invalidateQueries({ queryKey: ['cibles'] })
      if (succes) toast.success(succes)
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useCreerAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: actionsApi.creer,
    onSuccess: (fiche) => {
      queryClient.setQueryData(actionsKeys.fiche(fiche.id_action), fiche)
      queryClient.invalidateQueries({ queryKey: ['actions'] })
      queryClient.invalidateQueries({ queryKey: ['cibles'] })
      toast.success('Action créée')
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useSupprimerAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: actionsApi.supprimer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] })
      toast.success('Action supprimée')
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useBesoins(params: { statut?: string; type?: number; zone?: number; cible?: number }) {
  return useQuery({ queryKey: actionsKeys.besoins(params), queryFn: () => actionsApi.besoins(params) })
}

function useMutationBesoin<TVariables, TResult>(mutationFn: (v: TVariables) => Promise<TResult>, succes: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions', 'besoins'] })
      queryClient.invalidateQueries({ queryKey: ['cibles'] })
      toast.success(succes)
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export const useAjouterBesoin = () =>
  useMutationBesoin(
    ({ idCible, payload }: { idCible: number; payload: Parameters<typeof actionsApi.ajouterBesoin>[1] }) =>
      actionsApi.ajouterBesoin(idCible, payload),
    'Besoin ajouté',
  )
export const useModifierBesoin = () =>
  useMutationBesoin(
    ({ idBesoin, payload }: { idBesoin: number; payload: Parameters<typeof actionsApi.modifierBesoin>[1] }) =>
      actionsApi.modifierBesoin(idBesoin, payload),
    'Besoin mis à jour',
  )
export const useSupprimerBesoin = () => useMutationBesoin((id: number) => actionsApi.supprimerBesoin(id), 'Besoin supprimé')

export function useCalendrier(debut: string, fin: string) {
  return useQuery({
    queryKey: actionsKeys.calendrier(debut, fin),
    queryFn: () => actionsApi.calendrier(debut, fin),
    placeholderData: keepPreviousData,
  })
}

export function useMesActions() {
  return useQuery({ queryKey: actionsKeys.mes, queryFn: actionsApi.mesActions })
}

export function useVolontariat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idAction, retirer }: { idAction: number; retirer?: boolean }) =>
      retirer ? actionsApi.seRetirer(idAction) : actionsApi.seProposer(idAction),
    onSuccess: (_, { retirer }) => {
      queryClient.invalidateQueries({ queryKey: actionsKeys.mes })
      toast.success(retirer ? 'Votre participation est retirée' : 'Merci ! Votre proposition est envoyée au responsable')
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}
