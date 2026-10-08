import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/lib/api/client'
import { ciblesApi, type CiblePayload, type FiltresCibles } from '@/lib/api/cibles'

export const ciblesKeys = {
  liste: (filtres: FiltresCibles) => ['cibles', 'liste', filtres] as const,
  fiche: (idCible: number) => ['cibles', 'fiche', idCible] as const,
}

export function useCibles(filtres: FiltresCibles, enabled = true) {
  return useQuery({
    queryKey: ciblesKeys.liste(filtres),
    queryFn: () => ciblesApi.liste(filtres),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useFicheCible(idCible: number | null) {
  return useQuery({
    queryKey: ciblesKeys.fiche(idCible ?? 0),
    queryFn: () => ciblesApi.fiche(idCible as number),
    enabled: idCible !== null,
  })
}

function useMutationCibles<TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
  succes: string,
  { toastErreur = true }: { toastErreur?: boolean } = {},
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success(succes)
      queryClient.invalidateQueries({ queryKey: ['cibles'] })
    },
    onError: (error) => {
      if (toastErreur) toast.error(apiErrorMessage(error))
    },
  })
}

/** Les doublons potentiels (409) ne sont pas toastés : le formulaire les affiche. */
export const useCreerCible = () =>
  useMutationCibles((p: CiblePayload & { forcer?: boolean }) => ciblesApi.creer(p), 'Cible enregistrée', {
    toastErreur: false,
  })

export const useModifierCible = () =>
  useMutationCibles(
    ({ idCible, payload }: { idCible: number; payload: CiblePayload }) => ciblesApi.modifier(idCible, payload),
    'Cible mise à jour',
  )
export const useSupprimerCible = () =>
  useMutationCibles((idCible: number) => ciblesApi.supprimer(idCible), 'Cible supprimée')
export const useAjouterAppartenance = () =>
  useMutationCibles(
    ({ idCible, idAutre, role }: { idCible: number; idAutre: number; role: string }) =>
      ciblesApi.ajouterAppartenance(idCible, { id_cible: idAutre, role }),
    'Rattachement ajouté',
  )
export const useSupprimerAppartenance = () =>
  useMutationCibles((idAppartenance: number) => ciblesApi.supprimerAppartenance(idAppartenance), 'Rattachement retiré')
export const useFusionnerCibles = () =>
  useMutationCibles(
    ({ idCible, idDoublon }: { idCible: number; idDoublon: number }) => ciblesApi.fusionner(idCible, idDoublon),
    'Doublon fusionné',
  )
export const useImporterCibles = () =>
  useMutationCibles((fichier: File) => ciblesApi.importer(fichier), 'Import terminé')
