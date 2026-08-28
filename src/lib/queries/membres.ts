import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { membresApi } from '@/lib/api/membres'
import { apiErrorCode, apiErrorMessage } from '@/lib/api/client'
import type { FonctionAssociation, StatutCarte } from '@/lib/api/types'

export const membresKeys = {
  all: ['membres'] as const,
  sections: ['membres', 'sections'] as const,
  list: (params: { q?: string; statut_carte?: StatutCarte; id_section?: number; fonction?: FonctionAssociation; tri?: string }) =>
    ['membres', 'list', params] as const,
  detail: (id: number) => ['membres', 'detail', id] as const,
  recherche: (q: string) => ['membres', 'recherche', q] as const,
}

export function useSections() {
  return useQuery({ queryKey: membresKeys.sections, queryFn: membresApi.sections })
}

export function useMembres(params: { q?: string; statut_carte?: StatutCarte; id_section?: number; fonction?: FonctionAssociation; tri?: string } = {}) {
  return useQuery({ queryKey: membresKeys.list(params), queryFn: () => membresApi.liste(params) })
}

export function useMembre(idMembre: number | null) {
  return useQuery({
    queryKey: membresKeys.detail(idMembre ?? 0),
    queryFn: () => membresApi.detail(idMembre as number),
    enabled: idMembre !== null,
  })
}

export function useRechercheComptes(q: string) {
  return useQuery({
    queryKey: membresKeys.recherche(q),
    queryFn: () => membresApi.rechercheComptes(q),
    enabled: q.trim().length >= 2,
  })
}

export function useBloquerCarte() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idCarte: number) => membresApi.bloquerCarte(idCarte),
    onSuccess: () => {
      toast.success('Carte bloquée')
      queryClient.invalidateQueries({ queryKey: membresKeys.all })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Impossible de bloquer la carte')),
  })
}

export function useActiverCarte() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idCarte: number) => membresApi.activerCarte(idCarte),
    onSuccess: () => {
      toast.success('Carte réactivée')
      queryClient.invalidateQueries({ queryKey: membresKeys.all })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Impossible de réactiver la carte')),
  })
}

export function useImporterMembres() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (fichier: File) => membresApi.importerMembres(fichier),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membresKeys.all }),
    onError: (error) => toast.error(apiErrorMessage(error, "Échec de l'import")),
  })
}

export function useCreerMembreAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof membresApi.creerParAdmin>[0]) => membresApi.creerParAdmin(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membresKeys.all })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Création du membre impossible')),
  })
}

/**
 * Si le membre n'a pas encore d'email réel, le backend refuse avec le
 * code EMAIL_MANQUANT plutôt que d'échouer silencieusement à envoyer -
 * on l'expose ici pour que l'UI puisse ouvrir un prompt de saisie et
 * rejouer la mutation avec `email` renseigné.
 */
export function useRenvoyerIdentifiants() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idMembre, email }: { idMembre: number; email?: string }) =>
      membresApi.renvoyerIdentifiants(idMembre, email),
    onSuccess: (data, { idMembre }) => {
      if (data.email_envoye) {
        toast.success(`Identifiants renvoyés par email à ${data.email} !`)
      } else {
        toast.info(`Nouveau mot de passe généré : ${data.mot_de_passe_temporaire}`)
      }
      queryClient.invalidateQueries({ queryKey: membresKeys.detail(idMembre) })
      queryClient.invalidateQueries({ queryKey: membresKeys.all })
    },
    onError: (error) => {
      if (apiErrorCode(error) === 'EMAIL_MANQUANT') return
      toast.error(apiErrorMessage(error, 'Impossible de renvoyer les identifiants'))
    },
  })
}

export function useModifierMembre() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idMembre, ...payload }: { idMembre: number } & Parameters<typeof membresApi.modifier>[1]) =>
      membresApi.modifier(idMembre, payload),
    onSuccess: (_data, { idMembre }) => {
      toast.success('Fiche membre mise à jour')
      queryClient.invalidateQueries({ queryKey: membresKeys.detail(idMembre) })
      queryClient.invalidateQueries({ queryKey: membresKeys.all })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Impossible de modifier le membre')),
  })
}


