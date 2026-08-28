import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, Copy, Loader2, Mail, ShieldCheck, UserCheck, UserPlus } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
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
} from '@/components/ui'
import { useCreerMembreAdmin, useSections } from '@/lib/queries'
import { fonctionAssociationLabel } from '@/lib/utils/status'
import type { FonctionAssociation } from '@/lib/api/types'
import { toast } from 'sonner'

const schema = z
  .object({
    nom: z.string().min(1, 'Nom requis'),
    prenom: z.string().min(1, 'Prénom requis'),
    fonction_association: z.string().min(1, 'Fonction requise'),
    id_section: z.coerce.number().optional(),
    telephone: z.string().optional(),
    mode: z.enum(['MANUEL', 'EMAIL']),
    email: z.string().optional(),
    mot_de_passe: z.string().optional(),
  })
  .refine((data) => data.mode !== 'EMAIL' || (data.email && data.email.includes('@')), {
    message: 'Adresse email valide requise pour le mode Envoi par email',
    path: ['email'],
  })

type FormValues = z.infer<typeof schema>

interface CreateMembreAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateMembreAdminDialog({ open, onOpenChange }: CreateMembreAdminDialogProps) {
  const creer = useCreerMembreAdmin()
  const { data: sections } = useSections()

  const [result, setResult] = useState<{
    id_membre: number
    numero_adherent: string
    email: string
    mot_de_passe_temporaire: string | null
    email_envoye: boolean
    mode: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nom: '',
      prenom: '',
      fonction_association: 'MEMBRE_ACTIF',
      id_section: undefined,
      telephone: '',
      mode: 'MANUEL',
      email: '',
      mot_de_passe: '',
    },
  })

  const mode = watch('mode')
  const idSection = watch('id_section')
  const fonctionAssociation = watch('fonction_association')

  useEffect(() => {
    if (open) {
      setResult(null)
      setCopied(false)
      reset({
        nom: '',
        prenom: '',
        fonction_association: 'MEMBRE_ACTIF',
        id_section: undefined,
        telephone: '',
        mode: 'MANUEL',
        email: '',
        mot_de_passe: '',
      })
    }
  }, [open, sections, reset])

  async function onSubmit(values: FormValues) {
    try {
      const res = await creer.mutateAsync({
        nom: values.nom,
        prenom: values.prenom,
        fonction_association: values.fonction_association as FonctionAssociation,
        id_section: values.id_section || undefined,
        telephone: values.telephone || undefined,
        mode: values.mode,
        email: values.email || undefined,
        mot_de_passe: values.mot_de_passe || undefined,
      })
      setResult(res)
      toast.success(`Membre ${res.numero_adherent} créé avec succès !`)
    } catch {
      // géré par react-query
    }
  }

  function handleCopyCredentials() {
    if (!result) return
    const text = `Identifiants AP2A :\nNuméro d'adhérent : ${result.numero_adherent}\nIdentifiant/Email : ${result.email}\nMot de passe temporaire : ${result.mot_de_passe_temporaire ?? '—'}\n(À changer lors de la première connexion)`
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Identifiants copiés dans le presse-papiers !')
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5 text-primary" />
            Nouveau compte membre
          </DialogTitle>
          <DialogDescription>
            Créez la fiche adhérent et configurez son accès avec ou sans adresse email.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 py-2">
            <Card className="border-success/30 bg-success/10">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-success flex items-center gap-1">
                    <UserCheck className="size-4" />
                    Compte créé avec succès
                  </span>
                  <Badge variant="success">{result.numero_adherent}</Badge>
                </div>

                <div className="rounded-md bg-background/90 p-3 space-y-2 border border-border text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Numéro adhérent :</span>
                    <span className="font-mono font-semibold text-foreground">{result.numero_adherent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Identifiant / Login :</span>
                    <span className="font-mono text-foreground">{result.email}</span>
                  </div>
                  {result.mot_de_passe_temporaire && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mot de passe temporaire :</span>
                      <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {result.mot_de_passe_temporaire}
                      </span>
                    </div>
                  )}
                  {result.email_envoye && (
                    <p className="text-xs text-success flex items-center gap-1 mt-2">
                      <Mail className="size-3.5" />
                      Email avec identifiants envoyé au membre.
                    </p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-primary" />
                  Le membre sera automatiquement invité à changer son mot de passe dès sa première connexion.
                </p>

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1" onClick={handleCopyCredentials}>
                    {copied ? <Check className="size-4 mr-1.5 text-success" /> : <Copy className="size-4 mr-1.5" />}
                    {copied ? 'Copié !' : 'Copier les identifiants'}
                  </Button>
                  <Button className="flex-1" onClick={() => onOpenChange(false)}>
                    Fermer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" placeholder="Ex: Dupont" {...register('nom')} />
                {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prenom">Prénom</Label>
                <Input id="prenom" placeholder="Ex: Jean" {...register('prenom')} />
                {errors.prenom && <p className="text-xs text-destructive">{errors.prenom.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Fonction au sein d'AP2A</Label>
              <Select
                value={fonctionAssociation}
                onValueChange={(val: string) => setValue('fonction_association', val, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une fonction" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(fonctionAssociationLabel).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fonction_association && (
                <p className="text-xs text-destructive">{errors.fonction_association.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Section (optionnel)</Label>
                <Select
                  value={idSection ? String(idSection) : ''}
                  onValueChange={(val: string) => setValue('id_section', val ? Number(val) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucune" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections?.map((s) => (
                      <SelectItem key={s.id_section} value={String(s.id_section)}>
                        {s.nom_section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="telephone">Téléphone (optionnel)</Label>
                <Input id="telephone" placeholder="Ex: 0612345678" {...register('telephone')} />
              </div>
            </div>

            {/* Mode de création */}
            <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mode d'attribution des identifiants
              </Label>
              <div className="grid grid-cols-1 gap-2">
                <div
                  onClick={() => setValue('mode', 'MANUEL')}
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-2.5 transition-colors ${
                    mode === 'MANUEL'
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border bg-card hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <input
                    type="radio"
                    id="mode-manuel"
                    value="MANUEL"
                    checked={mode === 'MANUEL'}
                    onChange={() => setValue('mode', 'MANUEL')}
                    className="mt-0.5 text-primary"
                  />
                  <div className="space-y-0.5">
                    <Label htmlFor="mode-manuel" className="font-medium cursor-pointer text-foreground">
                      Remise directe / Sans email (Login & mot de passe temporaire)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Idéal pour les membres sans email. Les identifiants sont affichés à l'écran pour remise en main propre.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setValue('mode', 'EMAIL')}
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-2.5 transition-colors ${
                    mode === 'EMAIL'
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border bg-card hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <input
                    type="radio"
                    id="mode-email"
                    value="EMAIL"
                    checked={mode === 'EMAIL'}
                    onChange={() => setValue('mode', 'EMAIL')}
                    className="mt-0.5 text-primary"
                  />
                  <div className="space-y-0.5">
                    <Label htmlFor="mode-email" className="font-medium cursor-pointer text-foreground">
                      Envoi automatique par email
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Génère un mot de passe temporaire et envoie les instructions directement par email.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {mode === 'EMAIL' ? (
              <div className="space-y-1.5">
                <Label htmlFor="email">Adresse email du membre</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean.dupont@exemple.org"
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email (optionnel)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Laisser vide si aucun"
                    {...register('email')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mot_de_passe">Mot de passe temporaire</Label>
                  <Input
                    id="mot_de_passe"
                    placeholder="Auto si vide"
                    {...register('mot_de_passe')}
                  />
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={creer.isPending}>
                {creer.isPending && <Loader2 className="size-4 animate-spin mr-1.5" />}
                Créer le membre
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
