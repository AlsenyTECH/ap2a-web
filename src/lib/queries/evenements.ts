import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { evenementsApi } from '@/lib/api/evenements'
import { apiErrorMessage } from '@/lib/api/client'

export const evenementsKeys = {
  all: ['evenements'] as const,
  liste: ['evenements', 'liste'] as const,
  seances: (id: number) => ['evenements', 'seances', id] as const,
  detail: (id: number) => ['evenements', 'detail', id] as const,
  historique: ['evenements', 'historique'] as const,
  confirmations: (id: number) => ['evenements', 'confirmations', id] as const,
  mesEvenements: ['evenements', 'mes-evenements'] as const,
}

export function useEvenements() {
  return useQuery({ queryKey: evenementsKeys.liste, queryFn: evenementsApi.liste })
}

export function useSeancesEvenement(idEvenement: number | null) {
  return useQuery({
    queryKey: evenementsKeys.seances(idEvenement ?? 0),
    queryFn: () => evenementsApi.seances(idEvenement as number),
    enabled: idEvenement !== null,
  })
}

export function useEvenementDetail(idEvenement: number | null) {
  return useQuery({
    queryKey: evenementsKeys.detail(idEvenement ?? 0),
    queryFn: () => evenementsApi.detail(idEvenement as number),
    enabled: idEvenement !== null,
  })
}

export function useEvenementsHistorique() {
  return useQuery({ queryKey: evenementsKeys.historique, queryFn: evenementsApi.historique })
}

export function useConfirmationsEvenement(idEvenement: number | null) {
  return useQuery({
    queryKey: evenementsKeys.confirmations(idEvenement ?? 0),
    queryFn: () => evenementsApi.confirmations(idEvenement as number),
    enabled: idEvenement !== null,
  })
}

export function useMesEvenements() {
  return useQuery({ queryKey: evenementsKeys.mesEvenements, queryFn: evenementsApi.mesEvenements })
}

export function useCreerEvenement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof evenementsApi.creer>[0]) => evenementsApi.creer(payload),
    onSuccess: () => {
      toast.success('Événement créé')
      queryClient.invalidateQueries({ queryKey: evenementsKeys.liste })
      queryClient.invalidateQueries({ queryKey: evenementsKeys.historique })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Création impossible')),
  })
}

export function useModifierEvenement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idEvenement, payload }: { idEvenement: number; payload: Parameters<typeof evenementsApi.modifier>[1] }) =>
      evenementsApi.modifier(idEvenement, payload),
    onSuccess: (_, variables) => {
      toast.success('Événement mis à jour')
      queryClient.invalidateQueries({ queryKey: evenementsKeys.liste })
      queryClient.invalidateQueries({ queryKey: evenementsKeys.detail(variables.idEvenement) })
      queryClient.invalidateQueries({ queryKey: evenementsKeys.historique })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Modification impossible')),
  })
}

export function useAnnulerEvenement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idEvenement: number) => evenementsApi.annuler(idEvenement),
    onSuccess: (_, idEvenement) => {
      toast.success('Événement annulé')
      queryClient.invalidateQueries({ queryKey: evenementsKeys.liste })
      queryClient.invalidateQueries({ queryKey: evenementsKeys.detail(idEvenement) })
      queryClient.invalidateQueries({ queryKey: evenementsKeys.historique })
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Annulation impossible")),
  })
}

export function useSupprimerEvenement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idEvenement: number) => evenementsApi.supprimer(idEvenement),
    onSuccess: () => {
      toast.success('Événement supprimé')
      queryClient.invalidateQueries({ queryKey: evenementsKeys.liste })
      queryClient.invalidateQueries({ queryKey: evenementsKeys.historique })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Suppression impossible')),
  })
}

export function useTerminerEvenement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idEvenement: number) => evenementsApi.terminer(idEvenement),
    onSuccess: () => {
      toast.success('Événement clôturé')
      queryClient.invalidateQueries({ queryKey: evenementsKeys.all })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useAjouterInvite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      idEvenement,
      payload,
    }: {
      idEvenement: number
      payload: { nom: string; prenom: string; telephone?: string; organisation?: string }
    }) => evenementsApi.ajouterInvite(idEvenement, payload),
    onSuccess: (_, variables) => {
      toast.success('Invité ajouté')
      queryClient.invalidateQueries({ queryKey: evenementsKeys.confirmations(variables.idEvenement) })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useImporterInvites() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idEvenement, fichier }: { idEvenement: number; fichier: File }) =>
      evenementsApi.importerInvites(idEvenement, fichier),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: evenementsKeys.confirmations(variables.idEvenement) }),
    onError: (error) => toast.error(apiErrorMessage(error, "Échec de l'import")),
  })
}

export function useConfirmerEvenement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idEvenement: number) => evenementsApi.confirmer(idEvenement),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: evenementsKeys.mesEvenements })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Confirmation impossible')),
  })
}

export function useAnnulerConfirmation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idEvenement: number) => evenementsApi.annulerConfirmation(idEvenement),
    onSuccess: () => {
      toast.success('Confirmation annulée')
      queryClient.invalidateQueries({ queryKey: evenementsKeys.mesEvenements })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useActerProgrammeEvenement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idEvenement: number) => evenementsApi.acterProgramme(idEvenement),
    onSuccess: (data) => {
      toast.success(`Événement acté et programmé ! ${data.membres_notifies} membre(s) notifié(s).`)
      queryClient.invalidateQueries({ queryKey: evenementsKeys.liste })
      queryClient.invalidateQueries({ queryKey: evenementsKeys.all })
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Impossible d'acter l'événement")),
  })
}

