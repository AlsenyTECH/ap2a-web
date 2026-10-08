import { useState } from 'react'
import { Download, FileSpreadsheet, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@/components/ui'
import { useImporterCibles } from '@/lib/queries'
import { ciblesApi } from '@/lib/api/cibles'
import { apiErrorMessage } from '@/lib/api/client'
import type { ResultatImportCibles } from '@/lib/api/types'

interface ImportCiblesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportCiblesDialog({ open, onOpenChange }: ImportCiblesDialogProps) {
  const importer = useImporterCibles()
  const [fichier, setFichier] = useState<File | null>(null)
  const [resultat, setResultat] = useState<ResultatImportCibles | null>(null)

  async function telechargerModele() {
    try {
      const blob = await ciblesApi.telechargerModele()
      const url = URL.createObjectURL(blob)
      const lien = document.createElement('a')
      lien.href = url
      lien.download = 'modele_import_cibles.xlsx'
      lien.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Téléchargement impossible'))
    }
  }

  async function lancer() {
    if (!fichier) return
    try {
      setResultat(await importer.mutateAsync(fichier))
    } catch {
      // toast déjà affiché
    }
  }

  function fermer(ouvert: boolean) {
    if (!ouvert) {
      setFichier(null)
      setResultat(null)
    }
    onOpenChange(ouvert)
  }

  return (
    <Dialog open={open} onOpenChange={fermer}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="size-4 text-primary" />
            Importer des cibles depuis Excel
          </DialogTitle>
          <DialogDescription>
            Une ligne par cible. Les doublons possibles ne sont pas créés : ils sont listés pour vérification.
          </DialogDescription>
        </DialogHeader>

        {!resultat ? (
          <div className="space-y-4">
            <Button variant="outline" onClick={telechargerModele}>
              <Download className="size-4" />
              Télécharger le modèle (avec exemples)
            </Button>
            <Input type="file" accept=".xlsx" onChange={(e) => setFichier(e.target.files?.[0] ?? null)} />
          </div>
        ) : (
          <div className="max-h-[55vh] space-y-3 overflow-y-auto text-sm">
            <p>
              <strong>{resultat.crees}</strong> cible(s) créée(s), <strong>{resultat.appartenances}</strong> rattachement(s).
            </p>
            {resultat.doublons.length > 0 && (
              <div className="space-y-1">
                <p className="font-medium">Doublons possibles non créés ({resultat.doublons.length})</p>
                <ul className="space-y-1 text-xs">
                  {resultat.doublons.map((d) => (
                    <li key={d.ligne} className="rounded bg-muted/50 px-2 py-1">
                      Ligne {d.ligne} : {d.nom} ressemble à <strong>{d.ressemble_a.nom_complet}</strong> ({d.raisons.join(', ')})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {resultat.erreurs.length > 0 && (
              <div className="space-y-1">
                <p className="font-medium text-destructive">Lignes en erreur ({resultat.erreurs.length})</p>
                <ul className="list-disc space-y-0.5 pl-4 text-xs">
                  {resultat.erreurs.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => fermer(false)}>
            Fermer
          </Button>
          {!resultat && (
            <Button onClick={lancer} disabled={!fichier || importer.isPending}>
              {importer.isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              Importer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
