import { useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@/components/ui'
import { useNommerAdmin, useRechercheComptes } from '@/lib/queries'
import { permissionLabel } from '@/lib/utils/status'
import { cn } from '@/lib/utils'
import type { CompteRecherche, PermissionCode } from '@/lib/api/types'

const ALL_PERMISSIONS = Object.keys(permissionLabel) as PermissionCode[]

interface NommerAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  adminEmails: Set<string>
}

export function NommerAdminDialog({ open, onOpenChange, adminEmails }: NommerAdminDialogProps) {
  const [q, setQ] = useState('')
  const [compte, setCompte] = useState<CompteRecherche | null>(null)
  const [permissions, setPermissions] = useState<PermissionCode[]>([])
  const { data: comptes, isLoading: rechercheLoading } = useRechercheComptes(q)
  const nommerAdmin = useNommerAdmin()

  function handleClose(next: boolean) {
    if (!next) {
      setQ('')
      setCompte(null)
      setPermissions([])
    }
    onOpenChange(next)
  }

  function togglePermission(code: PermissionCode, checked: boolean) {
    setPermissions((prev) => (checked ? [...prev, code] : prev.filter((p) => p !== code)))
  }

  function handleSubmit() {
    if (!compte) return
    nommerAdmin.mutate(
      { idCompte: compte.id_compte, permissions },
      { onSuccess: () => handleClose(false) },
    )
  }

  const comptesDisponibles = (comptes ?? []).filter((c) => !adminEmails.has(c.email))

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nommer un administrateur</DialogTitle>
          <DialogDescription>
            Recherchez un compte puis sélectionnez ses permissions.
          </DialogDescription>
        </DialogHeader>

        {!compte ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {q.trim().length < 2 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Saisissez au moins 2 caractères pour rechercher.
                </p>
              ) : rechercheLoading ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Recherche…</p>
              ) : comptesDisponibles.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Aucun compte trouvé.</p>
              ) : (
                comptesDisponibles.map((c) => (
                  <button
                    key={c.email}
                    type="button"
                    onClick={() => setCompte(c)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-accent',
                    )}
                  >
                    <span>
                      <span className="font-medium text-foreground">
                        {c.prenom} {c.nom}
                      </span>
                      <span className="block text-xs text-muted-foreground">{c.email}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
              <span className="font-medium text-foreground">
                {compte.prenom} {compte.nom}
              </span>
              <span className="block text-xs text-muted-foreground">{compte.email}</span>
            </div>

            <div>
              <Label className="mb-2 block">Permissions</Label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_PERMISSIONS.map((code) => (
                  <label key={code} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={permissions.includes(code)}
                      onCheckedChange={(checked) => togglePermission(code, checked === true)}
                    />
                    {permissionLabel[code]}
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCompte(null)}>
                Retour
              </Button>
              <Button type="button" disabled={nommerAdmin.isPending} onClick={handleSubmit}>
                {nommerAdmin.isPending && <Loader2 className="animate-spin" />}
                Nommer
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
