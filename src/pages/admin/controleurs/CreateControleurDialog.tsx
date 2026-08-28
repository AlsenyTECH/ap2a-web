import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Search, UserCheck } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { useCreerControleur, useEvenements, useRechercheComptes } from '@/lib/queries'
import { cn } from '@/lib/utils'

interface CreateControleurDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const externeSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  mot_de_passe: z.string().min(6, 'Minimum 6 caractères'),
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  zone_affectation: z.string().optional(),
})

type ExterneFormValues = z.infer<typeof externeSchema>

export function CreateControleurDialog({ open, onOpenChange }: CreateControleurDialogProps) {
  const [tab, setTab] = useState('membre')
  const [q, setQ] = useState('')
  const [idEvenement, setIdEvenement] = useState('')
  const creerControleur = useCreerControleur()
  const { data: comptes, isLoading: rechercheLoading } = useRechercheComptes(q)
  const { data: evenements, isLoading: evenementsLoading } = useEvenements()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExterneFormValues>({ resolver: zodResolver(externeSchema) })

  function handleClose(next: boolean) {
    if (!next) {
      setQ('')
      reset()
      setTab('membre')
      setIdEvenement('')
    }
    onOpenChange(next)
  }

  function handleSelectCompte(email: string) {
    creerControleur.mutate(
      { email_membre: email, id_evenement: idEvenement ? Number(idEvenement) : undefined },
      { onSuccess: () => handleClose(false) },
    )
  }

  function onSubmitExterne(values: ExterneFormValues) {
    creerControleur.mutate(
      {
        email: values.email,
        mot_de_passe: values.mot_de_passe,
        nom: values.nom,
        prenom: values.prenom,
        zone_affectation: values.zone_affectation || undefined,
        id_evenement: idEvenement ? Number(idEvenement) : undefined,
      },
      { onSuccess: () => handleClose(false) },
    )
  }

  const comptesMembres = (comptes ?? []).filter((compte) => compte.est_membre)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouveau contrôleur</DialogTitle>
          <DialogDescription>
            Nommez un membre existant ou créez un compte contrôleur externe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="id_evenement">Événement à assigner (optionnel)</Label>
          <Select value={idEvenement} onValueChange={setIdEvenement} disabled={evenementsLoading}>
            <SelectTrigger id="id_evenement">
              <SelectValue placeholder="Aucun événement" />
            </SelectTrigger>
            <SelectContent>
              {evenements?.map((evt) => (
                <SelectItem key={evt.id_evenement} value={String(evt.id_evenement)}>
                  {evt.titre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="membre">Compte membre existant</TabsTrigger>
            <TabsTrigger value="externe">Contrôleur externe</TabsTrigger>
          </TabsList>

          <TabsContent value="membre" className="space-y-3">
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
              ) : comptesMembres.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Aucun membre trouvé.</p>
              ) : (
                comptesMembres.map((compte) => (
                  <button
                    key={compte.email}
                    type="button"
                    disabled={creerControleur.isPending}
                    onClick={() => handleSelectCompte(compte.email)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-accent disabled:pointer-events-none disabled:opacity-50',
                    )}
                  >
                    <span>
                      <span className="font-medium text-foreground">
                        {compte.prenom} {compte.nom}
                      </span>
                      <span className="block text-xs text-muted-foreground">{compte.email}</span>
                    </span>
                    {creerControleur.isPending ? (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    ) : (
                      <UserCheck className="size-4 text-muted-foreground" />
                    )}
                  </button>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="externe">
            <form onSubmit={handleSubmit(onSubmitExterne)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="nom">Nom</Label>
                  <Input id="nom" {...register('nom')} />
                  {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input id="prenom" {...register('prenom')} />
                  {errors.prenom && <p className="text-xs text-destructive">{errors.prenom.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mot_de_passe">Mot de passe</Label>
                <Input id="mot_de_passe" type="password" {...register('mot_de_passe')} />
                {errors.mot_de_passe && (
                  <p className="text-xs text-destructive">{errors.mot_de_passe.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="zone_affectation">Zone d'affectation (optionnel)</Label>
                <Input id="zone_affectation" {...register('zone_affectation')} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={creerControleur.isPending}>
                  {creerControleur.isPending && <Loader2 className="animate-spin" />}
                  Créer
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
