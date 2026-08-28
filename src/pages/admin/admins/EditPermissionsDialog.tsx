import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Skeleton,
} from '@/components/ui'
import { useAdminPermissions, useModifierPermissions } from '@/lib/queries'
import type { PermissionCode } from '@/lib/api/types'

interface EditPermissionsDialogProps {
  idCompte: number | null
  onOpenChange: (open: boolean) => void
}

export function EditPermissionsDialog({ idCompte, onOpenChange }: EditPermissionsDialogProps) {
  const open = idCompte !== null
  const { data, isLoading } = useAdminPermissions(idCompte)
  const modifierPermissions = useModifierPermissions()
  const [permissions, setPermissions] = useState<PermissionCode[]>([])

  useEffect(() => {
    if (data) setPermissions(data.permissions)
  }, [data])

  function togglePermission(code: PermissionCode, checked: boolean) {
    setPermissions((prev) => (checked ? [...prev, code] : prev.filter((p) => p !== code)))
  }

  function handleSave() {
    if (idCompte === null) return
    modifierPermissions.mutate({ idCompte, permissions })
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onOpenChange(false)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier les permissions</DialogTitle>
          {data && (
            <DialogDescription>
              {data.prenom} {data.nom}
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading || !data ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <div>
            <Label className="mb-2 block">Permissions</Label>
            <div className="grid grid-cols-2 gap-2">
              {data.permissions_disponibles.map(({ code, libelle }) => (
                <label key={code} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={permissions.includes(code)}
                    onCheckedChange={(checked) => togglePermission(code, checked === true)}
                  />
                  {libelle}
                </label>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="button" disabled={modifierPermissions.isPending || isLoading} onClick={handleSave}>
            {modifierPermissions.isPending && <Loader2 className="animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
