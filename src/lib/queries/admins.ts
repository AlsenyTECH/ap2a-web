import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminsApi } from '@/lib/api/admins'
import { apiErrorMessage } from '@/lib/api/client'
import type { PermissionCode } from '@/lib/api/types'

export const adminsKeys = {
  all: ['admins'] as const,
  permissions: (idCompte: number) => ['admins', 'permissions', idCompte] as const,
}

export function useAdmins() {
  return useQuery({ queryKey: adminsKeys.all, queryFn: adminsApi.liste })
}

export function useAdminPermissions(idCompte: number | null) {
  return useQuery({
    queryKey: adminsKeys.permissions(idCompte ?? 0),
    queryFn: () => adminsApi.permissions(idCompte as number),
    enabled: idCompte !== null,
  })
}

export function useNommerAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idCompte, permissions }: { idCompte: number; permissions: PermissionCode[] }) =>
      adminsApi.nommerAdmin(idCompte, permissions),
    onSuccess: () => {
      toast.success('Administrateur nommé')
      queryClient.invalidateQueries({ queryKey: adminsKeys.all })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Nomination impossible')),
  })
}

export function useModifierPermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idCompte, permissions }: { idCompte: number; permissions: PermissionCode[] }) =>
      adminsApi.modifierPermissions(idCompte, permissions),
    onSuccess: (_, variables) => {
      toast.success('Permissions mises à jour')
      queryClient.invalidateQueries({ queryKey: adminsKeys.permissions(variables.idCompte) })
      queryClient.invalidateQueries({ queryKey: adminsKeys.all })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })
}

export function useDestituerAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idCompte: number) => adminsApi.destituer(idCompte),
    onSuccess: () => {
      toast.success('Administrateur destitué')
      queryClient.invalidateQueries({ queryKey: adminsKeys.all })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Destitution impossible')),
  })
}
