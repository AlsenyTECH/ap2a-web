import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { actionsSocialesApi } from '@/lib/api/actionsSociales'
import { apiErrorMessage } from '@/lib/api/client'
import type { StatutActionSociale, TypeActionSociale } from '@/lib/api/types'

export const actionsSocialesKeys = {
  liste: (params: { type?: TypeActionSociale; statut?: StatutActionSociale }) =>
    ['actions-sociales', 'liste', params] as const,
  detail: (id: number) => ['actions-sociales', 'detail', id] as const,
}

export function useActionsSociales(params: { type?: TypeActionSociale; statut?: StatutActionSociale } = {}) {
  return useQuery({
    queryKey: actionsSocialesKeys.liste(params),
    queryFn: () => actionsSocialesApi.liste(params),
  })
}

export function useActionSocialeDetail(id: number | null) {
  return useQuery({
    queryKey: actionsSocialesKeys.detail(id ?? 0),
    queryFn: () => actionsSocialesApi.detail(id as number),
    enabled: id !== null,
  })
}

export function useCreerActionSociale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: actionsSocialesApi.creer,
    onSuccess: () => {
      toast.success('Action sociale créée')
      queryClient.invalidateQueries({ queryKey: ['actions-sociales'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Création impossible')),
  })
}

export function useAjouterBeneficiaire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idAction, payload }: { idAction: number; payload: Parameters<typeof actionsSocialesApi.ajouterBeneficiaire>[1] }) =>
      actionsSocialesApi.ajouterBeneficiaire(idAction, payload),
    onSuccess: (_, variables) => {
      toast.success('Bénéficiaire ajouté')
      queryClient.invalidateQueries({ queryKey: actionsSocialesKeys.detail(variables.idAction) })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Déjà inscrit ?')),
  })
}

export function useImporterBeneficiairesExcel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idAction, fichier }: { idAction: number; fichier: File }) =>
      actionsSocialesApi.importerExcel(idAction, fichier),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: actionsSocialesKeys.detail(variables.idAction) }),
    onError: (error) => toast.error(apiErrorMessage(error, "Échec de l'import")),
  })
}

export function useModifierBeneficiaire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      idBeneficiaire,
      payload,
    }: {
      idBeneficiaire: number
      idAction: number
      payload: Parameters<typeof actionsSocialesApi.modifierBeneficiaire>[1]
    }) => actionsSocialesApi.modifierBeneficiaire(idBeneficiaire, payload),
    onSuccess: (_, variables) => {
      toast.success('Bénéficiaire mis à jour')
      queryClient.invalidateQueries({ queryKey: actionsSocialesKeys.detail(variables.idAction) })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useModifierParticipation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      idAction,
      idParticipation,
      payload,
    }: {
      idAction: number
      idParticipation: number
      payload: Parameters<typeof actionsSocialesApi.modifierParticipation>[2]
    }) => actionsSocialesApi.modifierParticipation(idAction, idParticipation, payload),
    onSuccess: (_, variables) => {
      toast.success('Mis à jour')
      queryClient.invalidateQueries({ queryKey: actionsSocialesKeys.detail(variables.idAction) })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useRetirerBeneficiaire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idAction, idParticipation }: { idAction: number; idParticipation: number }) =>
      actionsSocialesApi.retirerBeneficiaire(idAction, idParticipation),
    onSuccess: (_, variables) => {
      toast.success('Bénéficiaire retiré')
      queryClient.invalidateQueries({ queryKey: actionsSocialesKeys.detail(variables.idAction) })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useModifierActionSociale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idAction, payload }: { idAction: number; payload: Parameters<typeof actionsSocialesApi.modifier>[1] }) =>
      actionsSocialesApi.modifier(idAction, payload),
    onSuccess: (_, variables) => {
      toast.success('Action sociale mise à jour')
      queryClient.invalidateQueries({ queryKey: ['actions-sociales'] })
      queryClient.invalidateQueries({ queryKey: actionsSocialesKeys.detail(variables.idAction) })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Modification impossible')),
  })
}

export function useSupprimerActionSociale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idAction: number) => actionsSocialesApi.supprimer(idAction),
    onSuccess: () => {
      toast.success('Action sociale supprimée')
      queryClient.invalidateQueries({ queryKey: ['actions-sociales'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Suppression impossible')),
  })
}

export function useBasculerDonRecu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idAction, idParticipation }: { idAction: number; idParticipation: number }) =>
      actionsSocialesApi.basculerDonRecu(idAction, idParticipation),
    onSuccess: (data, variables) => {
      toast.success(data.don_recu ? 'Don marqué comme reçu' : 'Don marqué comme non reçu')
      queryClient.invalidateQueries({ queryKey: actionsSocialesKeys.detail(variables.idAction) })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Modification statut don impossible')),
  })
}

export function useMettreAJourSuiviMedical() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      idAction,
      idParticipation,
      payload,
    }: {
      idAction: number
      idParticipation: number
      payload: Parameters<typeof actionsSocialesApi.mettreAJourSuiviMedical>[2]
    }) => actionsSocialesApi.mettreAJourSuiviMedical(idAction, idParticipation, payload),
    onSuccess: (_, variables) => {
      toast.success('Suivi médical et traitement enregistrés')
      queryClient.invalidateQueries({ queryKey: actionsSocialesKeys.detail(variables.idAction) })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Enregistrement du suivi médical impossible')),
  })
}


