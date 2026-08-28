import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImageOff, Loader2, Upload } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Skeleton,
  Switch,
} from '@/components/ui'
import { useConfig, useModifierConfig } from '@/lib/queries'

const schema = z.object({
  nom_association: z.string().min(1, "Nom de l'association requis"),
  slogan: z.string().optional(),
  email_contact: z.string().optional(),
  telephone_contact: z.string().optional(),
  seuil_certification_defaut: z.string().min(1, 'Requis'),
  duree_suivi_defaut_jours: z.string().min(1, 'Requis'),
  cotisation_active: z.boolean(),
  montant_cotisation_annuel: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function Parametres() {
  const { data: config, isLoading } = useConfig()
  const modifierConfig = useModifierConfig()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

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
      nom_association: '',
      slogan: '',
      email_contact: '',
      telephone_contact: '',
      seuil_certification_defaut: '',
      duree_suivi_defaut_jours: '',
      cotisation_active: false,
      montant_cotisation_annuel: '',
    },
  })

  useEffect(() => {
    if (config) {
      reset({
        nom_association: config.nom_association ?? '',
        slogan: config.slogan ?? '',
        email_contact: config.email_contact ?? '',
        telephone_contact: config.telephone_contact ?? '',
        seuil_certification_defaut: String(config.seuil_certification_defaut ?? ''),
        duree_suivi_defaut_jours: String(config.duree_suivi_defaut_jours ?? ''),
        cotisation_active: config.cotisation_active,
        montant_cotisation_annuel: config.montant_cotisation_annuel ?? '',
      })
    }
  }, [config, reset])

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview)
    }
  }, [logoPreview])

  const cotisationActive = watch('cotisation_active')

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  async function onSubmit(values: FormValues) {
    try {
      await modifierConfig.mutateAsync({
        payload: {
          nom_association: values.nom_association,
          slogan: values.slogan || null,
          email_contact: values.email_contact || null,
          telephone_contact: values.telephone_contact || null,
          seuil_certification_defaut: Number(values.seuil_certification_defaut),
          duree_suivi_defaut_jours: Number(values.duree_suivi_defaut_jours),
          cotisation_active: values.cotisation_active,
          montant_cotisation_annuel: values.cotisation_active ? values.montant_cotisation_annuel || null : null,
        },
        logo: logoFile ?? undefined,
      })
      setLogoFile(null)
    } catch {
      // erreur déjà toastée par le hook
    }
  }

  const displayedLogo = logoPreview ?? config?.logo ?? null

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Paramètres</h1>
        <p className="text-sm text-muted-foreground">Configuration générale de l'association.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identité</CardTitle>
              <CardDescription>Nom, slogan et logo affichés sur le portail et les cartes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                  {displayedLogo ? (
                    <img src={displayedLogo} alt="Logo de l'association" className="size-full object-contain" />
                  ) : (
                    <ImageOff className="size-6 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload />
                    Changer le logo
                  </Button>
                  {logoFile && <p className="text-xs text-muted-foreground">{logoFile.name}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nom_association">Nom de l'association</Label>
                <Input id="nom_association" {...register('nom_association')} />
                {errors.nom_association && (
                  <p className="text-xs text-destructive">{errors.nom_association.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slogan">Slogan</Label>
                <Input id="slogan" {...register('slogan')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email_contact">Email de contact</Label>
                  <Input id="email_contact" type="email" {...register('email_contact')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="telephone_contact">Téléphone de contact</Label>
                  <Input id="telephone_contact" {...register('telephone_contact')} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Formations & suivi</CardTitle>
              <CardDescription>Valeurs par défaut appliquées aux nouvelles cohortes.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="seuil_certification_defaut">Seuil de certification par défaut (%)</Label>
                <Input
                  id="seuil_certification_defaut"
                  type="number"
                  min="0"
                  max="100"
                  {...register('seuil_certification_defaut')}
                />
                {errors.seuil_certification_defaut && (
                  <p className="text-xs text-destructive">{errors.seuil_certification_defaut.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="duree_suivi_defaut_jours">Durée de suivi par défaut (jours)</Label>
                <Input
                  id="duree_suivi_defaut_jours"
                  type="number"
                  min="0"
                  {...register('duree_suivi_defaut_jours')}
                />
                {errors.duree_suivi_defaut_jours && (
                  <p className="text-xs text-destructive">{errors.duree_suivi_defaut_jours.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cotisation</CardTitle>
              <CardDescription>Activez la cotisation annuelle et définissez son montant.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="cotisation_active"
                  checked={cotisationActive}
                  onCheckedChange={(v) => setValue('cotisation_active', v === true)}
                />
                <Label htmlFor="cotisation_active" className="font-normal">
                  Cotisation annuelle active
                </Label>
              </div>
              {cotisationActive && (
                <div className="max-w-xs space-y-1.5">
                  <Label htmlFor="montant_cotisation_annuel">Montant annuel</Label>
                  <Input id="montant_cotisation_annuel" {...register('montant_cotisation_annuel')} />
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end">
            <Button type="submit" disabled={modifierConfig.isPending}>
              {modifierConfig.isPending && <Loader2 className="size-4 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
