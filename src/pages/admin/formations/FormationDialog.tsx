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
import { useCreerFormation, useModifierFormation } from '@/lib/queries'
import type { Formation } from '@/lib/api/types'

const schema = z.object({
  titre: z.string().min(1, 'Titre requis'),
  code_reference: z.string().optional(),
  description: z.string().optional(),
  domaine: z.string().optional(),
  duree_heures: z.string().optional(),
  prerequis: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const EMPTY_VALUES: FormValues = {
  titre: '',
  code_reference: '',
  description: '',
  domaine: '',
  duree_heures: '',
  prerequis: '',
}

interface FormationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formation?: Formation | null
}

export function FormationDialog({ open, onOpenChange, formation }: FormationDialogProps) {
  const creer = useCreerFormation()
  const modifier = useModifierFormation()
  const isEdit = Boolean(formation)
  const isPending = creer.isPending || modifier.isPending

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY_VALUES })

  useEffect(() => {
    if (!open) return
    if (formation) {
      reset({
        titre: formation.titre,
        code_reference: formation.code_reference ?? '',
        description: formation.description ?? '',
        domaine: formation.domaine ?? '',
        duree_heures: formation.duree_heures != null ? String(formation.duree_heures) : '',
        prerequis: formation.prerequis ?? '',
      })
    } else {
      reset(EMPTY_VALUES)
    }
  }, [open, formation, reset])

  async function onSubmit(values: FormValues) {
    const payload = {
      titre: values.titre,
      code_reference: values.code_reference || undefined,
      description: values.description || undefined,
      domaine: values.domaine || undefined,
      duree_heures: values.duree_heures ? Number(values.duree_heures) : undefined,
      prerequis: values.prerequis || undefined,
    }
    try {
      if (isEdit && formation) {
        await modifier.mutateAsync({ id: formation.id_formation, payload })
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
          <DialogTitle>{isEdit ? 'Modifier la formation' : 'Nouvelle formation'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Mettre à jour les informations du catalogue.'
              : 'Créer une nouvelle formation au catalogue — le statut et le public visé se gèrent au niveau de chaque cohorte.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="titre">Titre</Label>
            <Input id="titre" {...register('titre')} />
            {errors.titre && <p className="text-xs text-destructive">{errors.titre.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="code_reference">Code de référence</Label>
              <Input id="code_reference" {...register('code_reference')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duree_heures">Durée (heures)</Label>
              <Input id="duree_heures" type="number" min="0" {...register('duree_heures')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="domaine">Domaine</Label>
            <Input id="domaine" {...register('domaine')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prerequis">Prérequis</Label>
            <Textarea id="prerequis" {...register('prerequis')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? 'Enregistrer' : 'Créer la formation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
