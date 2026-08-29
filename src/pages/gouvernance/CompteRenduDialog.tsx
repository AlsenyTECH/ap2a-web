import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from '@/components/ui'
import { useCreerCompteRendu, useModifierCompteRendu } from '@/lib/queries'
import type { CompteRendu } from '@/lib/api/types'

const schema = z.object({
  titre: z.string().min(1, 'Titre requis'),
  date_reunion: z.string().min(1, 'Date requise'),
  contenu: z.string().min(1, 'Contenu requis'),
  decisions: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const EMPTY_VALUES: FormValues = { titre: '', date_reunion: '', contenu: '', decisions: '' }

interface CompteRenduDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  compteRendu: CompteRendu | null
}

export function CompteRenduDialog({ open, onOpenChange, compteRendu }: CompteRenduDialogProps) {
  const creer = useCreerCompteRendu()
  const modifier = useModifierCompteRendu()
  const enCours = creer.isPending || modifier.isPending

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY_VALUES })

  useEffect(() => {
    if (!open) return
    reset(
      compteRendu
        ? {
            titre: compteRendu.titre,
            date_reunion: compteRendu.date_reunion.slice(0, 10),
            contenu: compteRendu.contenu,
            decisions: compteRendu.decisions ?? '',
          }
        : EMPTY_VALUES,
    )
  }, [open, compteRendu, reset])

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        titre: values.titre,
        date_reunion: values.date_reunion,
        contenu: values.contenu,
        decisions: values.decisions || undefined,
      }
      if (compteRendu) {
        await modifier.mutateAsync({ idCompteRendu: compteRendu.id_compte_rendu, payload })
      } else {
        await creer.mutateAsync(payload)
      }
      onOpenChange(false)
    } catch {
      // erreur déjà toastée par le hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{compteRendu ? 'Modifier le compte-rendu' : 'Nouveau compte-rendu'}</DialogTitle>
          <DialogDescription>Réunion du bureau exécutif - visible par tous les membres.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="titre">Titre</Label>
            <Input id="titre" placeholder="Ex: Réunion du bureau - Août 2026" {...register('titre')} />
            {errors.titre && <p className="text-xs text-destructive">{errors.titre.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date_reunion">Date de la réunion</Label>
            <Input id="date_reunion" type="date" {...register('date_reunion')} />
            {errors.date_reunion && <p className="text-xs text-destructive">{errors.date_reunion.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contenu">Contenu</Label>
            <Textarea id="contenu" rows={5} placeholder="Points abordés, échanges..." {...register('contenu')} />
            {errors.contenu && <p className="text-xs text-destructive">{errors.contenu.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="decisions">Décisions (optionnel)</Label>
            <Textarea id="decisions" rows={3} placeholder="Décisions actées lors de cette réunion..." {...register('decisions')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={enCours}>
              {enCours && <Loader2 className="size-4 animate-spin mr-1.5" />}
              {compteRendu ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
