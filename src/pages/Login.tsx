import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, KeyRound } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { authApi } from '@/lib/api/auth'
import { apiErrorMessage } from '@/lib/api/client'
import {
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
} from '@/components/ui'

const schema = z.object({
  email: z.string().min(1, 'Identifiant ou email requis'),
  mot_de_passe: z.string().min(1, 'Mot de passe requis'),
})

const changeMdpSchema = z
  .object({
    nouveau_mot_de_passe: z.string().min(6, 'Au moins 6 caractères'),
    confirmer_mot_de_passe: z.string().min(6, 'Confirmation requise'),
  })
  .refine((d) => d.nouveau_mot_de_passe === d.confirmer_mot_de_passe, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmer_mot_de_passe'],
  })

type FormValues = z.infer<typeof schema>
type ChangeMdpValues = z.infer<typeof changeMdpSchema>

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [showChangeMdp, setShowChangeMdp] = useState(false)
  const [tempPassword, setTempPassword] = useState('')
  const [pendingUserRole, setPendingUserRole] = useState<{ est_admin: boolean; est_membre: boolean } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const {
    register: registerMdp,
    handleSubmit: handleMdpSubmit,
    formState: { errors: mdpErrors },
  } = useForm<ChangeMdpValues>({ resolver: zodResolver(changeMdpSchema) })

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      const user = await login(values.email, values.mot_de_passe)
      if (user.doit_changer_mot_de_passe) {
        setTempPassword(values.mot_de_passe)
        setPendingUserRole({ est_admin: user.est_admin, est_membre: user.est_membre })
        setShowChangeMdp(true)
        toast.info('Première connexion : veuillez définir votre mot de passe personnel.')
      } else {
        redirectUser(user.est_admin, user.est_membre)
      }
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Identifiant ou mot de passe incorrect'))
    } finally {
      setSubmitting(false)
    }
  }

  function redirectUser(est_admin: boolean, est_membre: boolean) {
    if (est_admin) navigate('/admin', { replace: true })
    else if (est_membre) navigate('/membre', { replace: true })
    else toast.error("Ce compte n'a pas accès au portail web.")
  }

  async function onSaveNewPassword(values: ChangeMdpValues) {
    setSubmitting(true)
    try {
      await authApi.changerMotDePasse(tempPassword, values.nouveau_mot_de_passe)
      toast.success('Mot de passe mis à jour avec succès !')
      setShowChangeMdp(false)
      if (pendingUserRole) {
        redirectUser(pendingUserRole.est_admin, pendingUserRole.est_membre)
      }
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Impossible de modifier le mot de passe'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <img
            src="/logo_AP2A.jpeg"
            alt="Logo AP2A"
            className="size-16 rounded-2xl object-cover shadow-md border-2 border-border"
          />
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">AP2A</h1>
            <p className="text-sm text-muted-foreground">Portail d'administration & espace membre</p>
          </div>
        </div>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Identifiant ou Email</Label>
                <Input
                  id="email"
                  type="text"
                  autoComplete="username"
                  placeholder="Email ou N° adhérent (ex: ADH-0001)"
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mot_de_passe">Mot de passe</Label>
                <Input
                  id="mot_de_passe"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('mot_de_passe')}
                />
                {errors.mot_de_passe && <p className="text-xs text-destructive">{errors.mot_de_passe.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Se connecter
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Accès sécurisé pour les membres et administrateurs de l'AP2A.
        </p>
      </div>

      <Dialog open={showChangeMdp}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-5 text-primary" />
              Changement de mot de passe obligatoire
            </DialogTitle>
            <DialogDescription>
              Il s'agit de votre première connexion. Veuillez choisir votre mot de passe personnel pour sécuriser votre compte.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMdpSubmit(onSaveNewPassword)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="nouveau_mot_de_passe">Nouveau mot de passe</Label>
              <Input
                id="nouveau_mot_de_passe"
                type="password"
                placeholder="Au moins 6 caractères"
                {...registerMdp('nouveau_mot_de_passe')}
              />
              {mdpErrors.nouveau_mot_de_passe && (
                <p className="text-xs text-destructive">{mdpErrors.nouveau_mot_de_passe.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmer_mot_de_passe">Confirmer le mot de passe</Label>
              <Input
                id="confirmer_mot_de_passe"
                type="password"
                placeholder="Répétez le mot de passe"
                {...registerMdp('confirmer_mot_de_passe')}
              />
              {mdpErrors.confirmer_mot_de_passe && (
                <p className="text-xs text-destructive">{mdpErrors.confirmer_mot_de_passe.message}</p>
              )}
            </div>
            <DialogFooter className="pt-2">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Enregistrer et continuer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

