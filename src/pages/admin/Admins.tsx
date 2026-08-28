import { useState } from 'react'
import { Plus, ShieldAlert, ShieldCheck, UserCog } from 'lucide-react'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui'
import { NommerAdminDialog } from '@/pages/admin/admins/NommerAdminDialog'
import { EditPermissionsDialog } from '@/pages/admin/admins/EditPermissionsDialog'
import { useAdmins, useDestituerAdmin } from '@/lib/queries'

export default function Admins() {
  const { data: admins, isLoading } = useAdmins()
  const destituerAdmin = useDestituerAdmin()
  const [nommerOpen, setNommerOpen] = useState(false)
  const [editIdCompte, setEditIdCompte] = useState<number | null>(null)
  const [destituerId, setDestituerId] = useState<number | null>(null)

  function handleDestituer() {
    if (destituerId === null) return
    destituerAdmin.mutate(destituerId, { onSuccess: () => setDestituerId(null) })
  }

  const adminEmails = new Set((admins ?? []).map((a) => a.email))

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground">Administrateurs</h1>
            <p className="text-sm text-muted-foreground">Gestion des comptes admin et de leurs permissions.</p>
          </div>
          <Button onClick={() => setNommerOpen(true)}>
            <Plus />
            Nommer un administrateur
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !admins || admins.length === 0 ? (
          <EmptyState icon={ShieldAlert} title="Aucun administrateur" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom Prénom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id_compte}>
                  <TableCell className="font-medium text-foreground">
                    {admin.prenom} {admin.nom}
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    {admin.est_admin_principal ? (
                      <Badge className="border-transparent bg-amber-500 text-white">
                        <ShieldCheck className="mr-1 size-3" />
                        Super Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <UserCog className="mr-1 size-3" />
                        Admin délégué
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditIdCompte(admin.id_compte)}>
                        Modifier les permissions
                      </Button>
                      {admin.est_admin_principal ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button variant="destructive" size="sm" disabled>
                                Destituer
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>L'administrateur principal ne peut pas être destitué.</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDestituerId(admin.id_compte)}
                        >
                          Destituer
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <NommerAdminDialog open={nommerOpen} onOpenChange={setNommerOpen} adminEmails={adminEmails} />
        <EditPermissionsDialog idCompte={editIdCompte} onOpenChange={() => setEditIdCompte(null)} />

        <ConfirmDialog
          open={destituerId !== null}
          onOpenChange={(next) => !next && setDestituerId(null)}
          title="Destituer cet administrateur"
          description="Le compte perdra ses droits d'administration et toutes ses permissions."
          confirmLabel="Destituer"
          variant="destructive"
          loading={destituerAdmin.isPending}
          onConfirm={handleDestituer}
        />
      </div>
    </TooltipProvider>
  )
}
