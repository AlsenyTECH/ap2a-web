import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/lib/api/client'
import {
  referentielsApi,
  type IndicateurPayload,
  type PartenairePayload,
  type TypeActionPayload,
  type ZonePayload,
} from '@/lib/api/referentiels'

export const referentielsKeys = {
  zones: (parent: number | 'racine', inclureInactives: boolean) =>
    ['referentiels', 'zones', parent, inclureInactives] as const,
  rechercheZones: (q: string) => ['referentiels', 'zones', 'recherche', q] as const,
  partenaires: (q: string, inclureInactifs: boolean) => ['referentiels', 'partenaires', q, inclureInactifs] as const,
  typesAction: (inclureInactifs: boolean) => ['referentiels', 'types-action', inclureInactifs] as const,
}

export function useZones(parent: number | 'racine', inclureInactives = false) {
  return useQuery({
    queryKey: referentielsKeys.zones(parent, inclureInactives),
    queryFn: () => referentielsApi.zones({ parent, inclure_inactives: inclureInactives }),
  })
}

export function useRechercheZones(q: string) {
  return useQuery({
    queryKey: referentielsKeys.rechercheZones(q),
    queryFn: () => referentielsApi.zones({ q }),
    enabled: q.trim().length >= 2,
  })
}

/** Mutation générique : toast de succès et rafraîchissement d'un préfixe de clés. */
function useMutationReferentiel<TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
  succes: string,
  prefixe: string,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success(succes)
      queryClient.invalidateQueries({ queryKey: ['referentiels', prefixe] })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export const useCreerZone = () => useMutationReferentiel((p: ZonePayload) => referentielsApi.creerZone(p), 'Zone ajoutée', 'zones')
export const useModifierZone = () =>
  useMutationReferentiel(
    ({ idZone, payload }: { idZone: number; payload: Partial<ZonePayload> }) => referentielsApi.modifierZone(idZone, payload),
    'Zone mise à jour',
    'zones',
  )
export const useSupprimerZone = () =>
  useMutationReferentiel((idZone: number) => referentielsApi.supprimerZone(idZone), 'Zone supprimée', 'zones')

export function usePartenaires(q = '', inclureInactifs = false) {
  return useQuery({
    queryKey: referentielsKeys.partenaires(q, inclureInactifs),
    queryFn: () => referentielsApi.partenaires({ q, inclure_inactifs: inclureInactifs }),
  })
}

export const useCreerPartenaire = () =>
  useMutationReferentiel((p: PartenairePayload) => referentielsApi.creerPartenaire(p), 'Partenaire ajouté', 'partenaires')
export const useModifierPartenaire = () =>
  useMutationReferentiel(
    ({ idPartenaire, payload }: { idPartenaire: number; payload: Partial<PartenairePayload> }) =>
      referentielsApi.modifierPartenaire(idPartenaire, payload),
    'Partenaire mis à jour',
    'partenaires',
  )
export const useSupprimerPartenaire = () =>
  useMutationReferentiel(
    (idPartenaire: number) => referentielsApi.supprimerPartenaire(idPartenaire),
    'Partenaire supprimé',
    'partenaires',
  )

export function useTypesAction(inclureInactifs = false) {
  return useQuery({
    queryKey: referentielsKeys.typesAction(inclureInactifs),
    queryFn: () => referentielsApi.typesAction(inclureInactifs),
  })
}

export const useCreerTypeAction = () =>
  useMutationReferentiel((p: TypeActionPayload) => referentielsApi.creerTypeAction(p), "Type d'action créé", 'types-action')
export const useModifierTypeAction = () =>
  useMutationReferentiel(
    ({ idTypeAction, payload }: { idTypeAction: number; payload: Partial<TypeActionPayload> }) =>
      referentielsApi.modifierTypeAction(idTypeAction, payload),
    "Type d'action mis à jour",
    'types-action',
  )
export const useSupprimerTypeAction = () =>
  useMutationReferentiel(
    (idTypeAction: number) => referentielsApi.supprimerTypeAction(idTypeAction),
    "Type d'action supprimé",
    'types-action',
  )

export const useCreerIndicateur = () =>
  useMutationReferentiel(
    ({ idTypeAction, payload }: { idTypeAction: number; payload: IndicateurPayload }) =>
      referentielsApi.creerIndicateur(idTypeAction, payload),
    'Indicateur ajouté',
    'types-action',
  )
export const useModifierIndicateur = () =>
  useMutationReferentiel(
    ({ idIndicateur, payload }: { idIndicateur: number; payload: Partial<IndicateurPayload> }) =>
      referentielsApi.modifierIndicateur(idIndicateur, payload),
    'Indicateur mis à jour',
    'types-action',
  )
export const useSupprimerIndicateur = () =>
  useMutationReferentiel(
    (idIndicateur: number) => referentielsApi.supprimerIndicateur(idIndicateur),
    'Indicateur supprimé',
    'types-action',
  )
