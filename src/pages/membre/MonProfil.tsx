import { useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Camera, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api/auth'
import { apiErrorMessage, mediaUrl } from '@/lib/api/client'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
} from '@/components/ui'
import { initials } from '@/lib/utils/format'

const MON_PROFIL_KEY = ['auth', 'mon-profil']

const profilSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  telephone: z.string().optional(),
})
type ProfilFormValues = z.infer<typeof profilSchema>

const motDePasseSchema = z
  .object({
    ancien_mot_de_passe: z.string().min(1, 'Ancien mot de passe requis'),
    nouveau_mot_de_passe: z.string().min(8, 'Au moins 8 caractères'),
    confirmation: z.string().min(1, 'Confirmation requise'),
  })
  .refine((data) => data.nouveau_mot_de_passe === data.confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmation'],
  })
type MotDePasseFormValues = z.infer<typeof motDePasseSchema>

export default function MonProfil() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: profil, isLoading } = useQuery({
    queryKey: MON_PROFIL_KEY,
    queryFn: authApi.monProfil,
  })

  const {
    register: registerProfil,
    handleSubmit: handleSubmitProfil,
    formState: { errors: profilErrors },
  } = useForm<ProfilFormValues>({
    resolver: zodResolver(profilSchema),
    values: profil
      ? { nom: profil.nom, prenom: profil.prenom, telephone: profil.telephone ?? '' }
      : undefined,
  })

  const modifierProfil = useMutation({
    mutationFn: (values: ProfilFormValues) =>
      authApi.modifierProfil({
        nom: values.nom,
        prenom: values.prenom,
        telephone: values.telephone || undefined,
      }),
    onSuccess: () => {
      toast.success('Profil mis à jour')
      queryClient.invalidateQueries({ queryKey: MON_PROFIL_KEY })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Mise à jour impossible')),
  })

  const televerserPhoto = useMutation({
    mutationFn: (photo: File) => authApi.televerserPhoto(photo),
    onSuccess: () => {
      toast.success('Photo mise à jour')
      queryClient.invalidateQueries({ queryKey: MON_PROFIL_KEY })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Téléversement impossible')),
  })

  const {
    register: registerMotDePasse,
    handleSubmit: handleSubmitMotDePasse,
    reset: resetMotDePasse,
    formState: { errors: motDePasseErrors },
  } = useForm<MotDePasseFormValues>({ resolver: zodResolver(motDePasseSchema) })

  const changerMotDePasse = useMutation({
    mutationFn: (values: MotDePasseFormValues) =>
      authApi.changerMotDePasse(values.ancien_mot_de_passe, values.nouveau_mot_de_passe),
    onSuccess: () => {
      toast.success('Mot de passe modifié')
      resetMotDePasse({ ancien_mot_de_passe: '', nouveau_mot_de_passe: '', confirmation: '' })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Changement impossible')),
  })

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) televerserPhoto.mutate(file)
    e.target.value = ''
  }

  if (isLoading || !profil) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mon profil</CardTitle>
          <CardDescription>Vos informations personnelles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="group relative"
              onClick={() => fileInputRef.current?.click()}
              disabled={televerserPhoto.isPending}
            >
              <Avatar className="size-20">
                {profil.photo ? <AvatarImage src={mediaUrl(profil.photo)} alt={`${profil.prenom} ${profil.nom}`} /> : null}
                <AvatarFallback>{initials(profil.nom, profil.prenom)}</AvatarFallback>
              </Avatar>
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                {televerserPhoto.isPending ? (
                  <Loader2 className="size-5 animate-spin text-white" />
                ) : (
                  <Camera className="size-5 text-white" />
                )}
              </span>
            </button>
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={televerserPhoto.isPending}
              >
                Changer la photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          <form onSubmit={handleSubmitProfil((v) => modifierProfil.mutate(v))} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" {...registerProfil('nom')} />
                {profilErrors.nom && <p className="text-xs text-destructive">{profilErrors.nom.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prenom">Prénom</Label>
                <Input id="prenom" {...registerProfil('prenom')} />
                {profilErrors.prenom && <p className="text-xs text-destructive">{profilErrors.prenom.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profil.email} disabled readOnly />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input id="telephone" {...registerProfil('telephone')} />
            </div>
            <Button type="submit" disabled={modifierProfil.isPending}>
              {modifierProfil.isPending && <Loader2 className="size-4 animate-spin" />}
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Changer le mot de passe</CardTitle>
          <CardDescription>Choisissez un mot de passe d'au moins 8 caractères.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmitMotDePasse((v) => changerMotDePasse.mutate(v))}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="ancien_mot_de_passe">Ancien mot de passe</Label>
              <Input
                id="ancien_mot_de_passe"
                type="password"
                autoComplete="current-password"
                {...registerMotDePasse('ancien_mot_de_passe')}
              />
              {motDePasseErrors.ancien_mot_de_passe && (
                <p className="text-xs text-destructive">{motDePasseErrors.ancien_mot_de_passe.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nouveau_mot_de_passe">Nouveau mot de passe</Label>
              <Input
                id="nouveau_mot_de_passe"
                type="password"
                autoComplete="new-password"
                {...registerMotDePasse('nouveau_mot_de_passe')}
              />
              {motDePasseErrors.nouveau_mot_de_passe && (
                <p className="text-xs text-destructive">{motDePasseErrors.nouveau_mot_de_passe.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmation">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirmation"
                type="password"
                autoComplete="new-password"
                {...registerMotDePasse('confirmation')}
              />
              {motDePasseErrors.confirmation && (
                <p className="text-xs text-destructive">{motDePasseErrors.confirmation.message}</p>
              )}
            </div>
            <Button type="submit" disabled={changerMotDePasse.isPending}>
              {changerMotDePasse.isPending && <Loader2 className="size-4 animate-spin" />}
              Changer le mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
