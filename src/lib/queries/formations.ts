import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formationsApi } from '@/lib/api/formations'
import { apiErrorMessage } from '@/lib/api/client'
import type { StatutCohorte } from '@/lib/api/types'

export const formationsKeys = {
  liste: ['formations', 'liste'] as const,
  /** Préfixe seul (sans idFormation) : sert à invalider TOUTES les listes de cohortes en une fois. */
  cohortesToutes: ['formations', 'cohortes'] as const,
  cohortes: (idFormation: number) => ['formations', 'cohortes', idFormation] as const,
  cohorteDetail: (idCohorte: number) => ['formations', 'cohorte-detail', idCohorte] as const,
  seancesCohorte: (idCohorte: number) => ['formations', 'seances-cohorte', idCohorte] as const,
  participants: (idCohorte: number) => ['formations', 'participants', idCohorte] as const,
  participantDetail: (idParticipant: number) => ['formations', 'participant-detail', idParticipant] as const,
  mesCohortes: ['formations', 'mes-cohortes'] as const,
}

export function useFormations() {
  return useQuery({ queryKey: formationsKeys.liste, queryFn: formationsApi.liste })
}

export function useCohortes(idFormation: number | null) {
  return useQuery({
    queryKey: formationsKeys.cohortes(idFormation ?? 0),
    queryFn: () => formationsApi.cohortes(idFormation as number),
    enabled: idFormation !== null,
  })
}

export function useCohorteDetail(idCohorte: number | null) {
  return useQuery({
    queryKey: formationsKeys.cohorteDetail(idCohorte ?? 0),
    queryFn: () => formationsApi.detailCohorte(idCohorte as number),
    enabled: idCohorte !== null,
  })
}

export function useSeancesCohorte(idCohorte: number | null) {
  return useQuery({
    queryKey: formationsKeys.seancesCohorte(idCohorte ?? 0),
    queryFn: () => formationsApi.seancesCohorte(idCohorte as number),
    enabled: idCohorte !== null,
  })
}

export function useParticipantsCohorte(idCohorte: number | null) {
  return useQuery({
    queryKey: formationsKeys.participants(idCohorte ?? 0),
    queryFn: () => formationsApi.participants(idCohorte as number),
    enabled: idCohorte !== null,
  })
}

export function useParticipantDetail(idParticipant: number | null) {
  return useQuery({
    queryKey: formationsKeys.participantDetail(idParticipant ?? 0),
    queryFn: () => formationsApi.detailParticipant(idParticipant as number),
    enabled: idParticipant !== null,
  })
}

export function useMesCohortes() {
  return useQuery({ queryKey: formationsKeys.mesCohortes, queryFn: formationsApi.mesCohortes })
}

export function useCreerFormation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: formationsApi.creer,
    onSuccess: () => {
      toast.success('Formation créée')
      queryClient.invalidateQueries({ queryKey: formationsKeys.liste })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Création impossible')),
  })
}

export function useModifierFormation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Partial<{
        titre: string
        code_reference: string
        description: string
        domaine: string
        duree_heures: number
        prerequis: string
      }>
    }) => formationsApi.modifier(id, payload),
    onSuccess: () => {
      toast.success('Formation mise à jour')
      queryClient.invalidateQueries({ queryKey: formationsKeys.liste })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useSupprimerFormation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => formationsApi.supprimer(id),
    onSuccess: () => {
      toast.success('Formation supprimée')
      queryClient.invalidateQueries({ queryKey: formationsKeys.liste })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Suppression impossible (cohortes existantes ?)')),
  })
}

export function useCreerCohorte() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: formationsApi.creerCohorte,
    onSuccess: (_, variables) => {
      toast.success('Cohorte créée')
      queryClient.invalidateQueries({ queryKey: formationsKeys.cohortes(variables.id_formation) })
      queryClient.invalidateQueries({ queryKey: formationsKeys.liste })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Création impossible')),
  })
}

export function useChangerStatutCohorte() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idCohorte, statut }: { idCohorte: number; statut: StatutCohorte }) =>
      formationsApi.changerStatutCohorte(idCohorte, statut),
    onSuccess: (_, variables) => {
      toast.success('Statut mis à jour')
      queryClient.invalidateQueries({ queryKey: formationsKeys.cohorteDetail(variables.idCohorte) })
      queryClient.invalidateQueries({ queryKey: formationsKeys.cohortesToutes })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useTerminerCohorte() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idCohorte: number) => formationsApi.terminerCohorte(idCohorte),
    onSuccess: (_, idCohorte) => {
      toast.success('Cohorte clôturée')
      queryClient.invalidateQueries({ queryKey: formationsKeys.cohorteDetail(idCohorte) })
      queryClient.invalidateQueries({ queryKey: formationsKeys.cohortesToutes })
      queryClient.invalidateQueries({ queryKey: formationsKeys.liste })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Impossible de terminer la cohorte')),
  })
}

export function useModifierParticipant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      idParticipant,
      payload,
    }: {
      idParticipant: number
      idCohorte: number
      payload: Partial<{ nom: string; prenom: string; telephone: string; numero_carte_identite: string }>
    }) => formationsApi.modifierParticipant(idParticipant, payload),
    onSuccess: (_, variables) => {
      toast.success('Participant mis à jour')
      queryClient.invalidateQueries({ queryKey: formationsKeys.participants(variables.idCohorte) })
      queryClient.invalidateQueries({ queryKey: formationsKeys.participantDetail(variables.idParticipant) })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useModifierCohorte() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idCohorte, payload }: { idCohorte: number; payload: Record<string, unknown> }) =>
      formationsApi.modifierCohorte(idCohorte, payload),
    onSuccess: (_, variables) => {
      toast.success('Cohorte mise à jour')
      queryClient.invalidateQueries({ queryKey: formationsKeys.cohorteDetail(variables.idCohorte) })
      queryClient.invalidateQueries({ queryKey: formationsKeys.cohortesToutes })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useSupprimerCohorte() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idCohorte: number) => formationsApi.supprimerCohorte(idCohorte),
    onSuccess: () => {
      toast.success('Cohorte supprimée')
      queryClient.invalidateQueries({ queryKey: formationsKeys.liste })
      queryClient.invalidateQueries({ queryKey: formationsKeys.cohortesToutes })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Suppression impossible')),
  })
}

export function useInscriptionCohorte() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idCohorte: number) => formationsApi.inscription(idCohorte),
    onSuccess: () => {
      toast.success('Inscription confirmée')
      queryClient.invalidateQueries({ queryKey: formationsKeys.mesCohortes })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Inscription impossible')),
  })
}

export function useAjouterParticipant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      idCohorte,
      payload,
    }: {
      idCohorte: number
      payload: { nom: string; prenom: string; telephone?: string; numero_carte_identite?: string }
    }) => formationsApi.ajouterParticipant(idCohorte, payload),
    onSuccess: (_, variables) => {
      toast.success('Participant ajouté')
      queryClient.invalidateQueries({ queryKey: formationsKeys.participants(variables.idCohorte) })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useImporterParticipantsExcel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idCohorte, fichier }: { idCohorte: number; fichier: File }) =>
      formationsApi.importerExcel(idCohorte, fichier),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: formationsKeys.participants(variables.idCohorte) }),
    onError: (error) => toast.error(apiErrorMessage(error, "Échec de l'import")),
  })
}

export function useTeleverserPhotoParticipant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idParticipant, photo }: { idParticipant: number; photo: File }) =>
      formationsApi.televerserPhotoParticipant(idParticipant, photo),
    onSuccess: (_, variables) => {
      toast.success('Photo mise à jour')
      queryClient.invalidateQueries({ queryKey: formationsKeys.participantDetail(variables.idParticipant) })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useConfirmerPresenceCohorte() {
  return useMutation({
    mutationFn: formationsApi.confirmerPresence,
    onError: (error) => toast.error(apiErrorMessage(error, 'Confirmation impossible')),
  })
}

export function useAjouterSeanceCohorte() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idCohorte, payload }: { idCohorte: number; payload: Parameters<typeof formationsApi.ajouterSeance>[1] }) =>
      formationsApi.ajouterSeance(idCohorte, payload),
    onSuccess: (_, variables) => {
      toast.success('Séance ajoutée')
      queryClient.invalidateQueries({ queryKey: formationsKeys.seancesCohorte(variables.idCohorte) })
      queryClient.invalidateQueries({ queryKey: formationsKeys.cohorteDetail(variables.idCohorte) })
      queryClient.invalidateQueries({ queryKey: formationsKeys.cohortesToutes })
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Ajout de séance impossible")),
  })
}

export function useModifierSeanceCohorte() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      idSeanceCohorte,
      payload,
    }: {
      idSeanceCohorte: number
      idCohorte: number
      payload: Parameters<typeof formationsApi.modifierSeance>[1]
    }) => formationsApi.modifierSeance(idSeanceCohorte, payload),
    onSuccess: (_, variables) => {
      toast.success('Séance mise à jour')
      queryClient.invalidateQueries({ queryKey: formationsKeys.seancesCohorte(variables.idCohorte) })
      queryClient.invalidateQueries({ queryKey: formationsKeys.cohorteDetail(variables.idCohorte) })
      queryClient.invalidateQueries({ queryKey: formationsKeys.cohortesToutes })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Modification de séance impossible')),
  })
}

export function useSupprimerSeanceCohorte() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idSeanceCohorte }: { idSeanceCohorte: number; idCohorte: number }) =>
      formationsApi.supprimerSeance(idSeanceCohorte),
    onSuccess: (_, variables) => {
      toast.success('Séance supprimée')
      queryClient.invalidateQueries({ queryKey: formationsKeys.seancesCohorte(variables.idCohorte) })
      queryClient.invalidateQueries({ queryKey: formationsKeys.cohorteDetail(variables.idCohorte) })
      queryClient.invalidateQueries({ queryKey: formationsKeys.cohortesToutes })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Suppression de séance impossible')),
  })
}

export function useRetirerParticipantCohorte() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idInscription }: { idInscription: number; idCohorte: number }) =>
      formationsApi.retirerParticipant(idInscription),
    onSuccess: (_, variables) => {
      toast.success('Participant retiré de la cohorte')
      queryClient.invalidateQueries({ queryKey: formationsKeys.participants(variables.idCohorte) })
      queryClient.invalidateQueries({ queryKey: formationsKeys.cohorteDetail(variables.idCohorte) })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Retrait impossible')),
  })
}

export function useActerProgrammeCohorte() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idCohorte: number) => formationsApi.acterProgrammeCohorte(idCohorte),
    onSuccess: (data, idCohorte) => {
      toast.success(`Cohorte actée et programmée ! ${data.membres_notifies} membre(s) notifié(s).`)
      queryClient.invalidateQueries({ queryKey: formationsKeys.cohorteDetail(idCohorte) })
      queryClient.invalidateQueries({ queryKey: formationsKeys.cohortesToutes })
      queryClient.invalidateQueries({ queryKey: formationsKeys.liste })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Impossible de programmer la cohorte')),
  })
}


