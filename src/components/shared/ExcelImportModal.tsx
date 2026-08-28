import { useRef, useState, type ReactNode } from 'react'
import { FileSpreadsheet, Loader2, UploadCloud } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { apiErrorMessage } from '@/lib/api/client'

interface ExcelImportModalProps<TResult> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  instructions: ReactNode
  onImport: (fichier: File) => Promise<TResult>
  renderResult: (result: TResult) => ReactNode
  onDone?: () => void
}

/**
 * Modal générique d'import Excel : drag & drop ou sélection de fichier,
 * appelle `onImport`, affiche le récapitulatif via `renderResult`. Réutilisé
 * à l'identique pour Membres, Participants, Bénéficiaires, Invités.
 */
export function ExcelImportModal<TResult>({
  open,
  onOpenChange,
  title,
  instructions,
  onImport,
  renderResult,
  onDone,
}: ExcelImportModalProps<TResult>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TResult | null>(null)

  function reset() {
    setDragActive(false)
    setLoading(false)
    setError(null)
    setResult(null)
  }

  function handleClose(next: boolean) {
    if (!next) {
      reset()
      onDone?.()
    }
    onOpenChange(next)
  }

  async function handleFile(file: File) {
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setError('Format invalide : seuls les fichiers .xlsx ou .xls sont acceptés.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await onImport(file)
      setResult(res)
    } catch (err) {
      setError(apiErrorMessage(err, "Échec de l'import"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{instructions}</DialogDescription>
        </DialogHeader>

        {!result && (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragActive(false)
              const file = e.dataTransfer.files?.[0]
              if (file) handleFile(file)
            }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors',
              dragActive ? 'border-primary bg-accent' : 'border-border bg-muted/40 hover:bg-muted',
            )}
          >
            {loading ? (
              <Loader2 className="size-8 animate-spin text-primary" />
            ) : (
              <UploadCloud className="size-8 text-muted-foreground" />
            )}
            <p className="text-sm font-medium">
              {loading ? 'Import en cours…' : 'Glissez un fichier ici ou cliquez pour parcourir'}
            </p>
            <p className="text-xs text-muted-foreground">Fichiers .xlsx ou .xls</p>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-success">
              <FileSpreadsheet className="size-5" />
              <p className="text-sm font-medium">Import terminé</p>
            </div>
            <div className="max-h-64 overflow-y-auto rounded-md border border-border p-3 text-sm">
              {renderResult(result)}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            {result ? 'Fermer' : 'Annuler'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
