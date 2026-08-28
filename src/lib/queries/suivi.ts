import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { suiviApi } from '@/lib/api/suivi'
import { apiErrorMessage } from '@/lib/api/client'

export const suiviKeys = {
  cohorte: (id: number) => ['suivi', 'cohorte', id] as const,
  participant: (id: number) => ['suivi', 'participant', id] as const,
}

export function useSuivisCohorte(idCohorte: number | null) {
  return useQuery({
    queryKey: suiviKeys.cohorte(idCohorte ?? 0),
    queryFn: () => suiviApi.suivisCohorte(idCohorte as number),
    enabled: idCohorte !== null,
  })
}

export function useSuivisParticipant(idParticipant: number | null) {
  return useQuery({
    queryKey: suiviKeys.participant(idParticipant ?? 0),
    queryFn: () => suiviApi.suivisParticipant(idParticipant as number),
    enabled: idParticipant !== null,
  })
}

export function useCreerSuivi() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: suiviApi.creer,
    onSuccess: (_, variables) => {
      toast.success('Fiche de suivi enregistrée')
      queryClient.invalidateQueries({ queryKey: suiviKeys.cohorte(variables.id_cohorte) })
      queryClient.invalidateQueries({ queryKey: suiviKeys.participant(variables.id_participant) })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Enregistrement impossible')),
  })
}
