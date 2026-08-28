export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive'

interface StatusMeta {
  label: string
  variant: BadgeVariant
}

function meta<T extends string>(map: Record<T, StatusMeta>) {
  return (key: T): StatusMeta => map[key] ?? { label: key, variant: 'secondary' }
}

export const statutAdhesionMeta = meta({
  ACTIF: { label: 'Actif', variant: 'success' },
  SUSPENDU: { label: 'Suspendu', variant: 'warning' },
  EXPIRE: { label: 'Expiré', variant: 'destructive' },
})

export const statutCarteMeta = meta({
  ACTIVE: { label: 'Active', variant: 'success' },
  BLOQUEE: { label: 'Bloquée', variant: 'destructive' },
  PERDUE: { label: 'Perdue', variant: 'warning' },
})

export const statutCompteMeta = meta({
  ACTIF: { label: 'Actif', variant: 'success' },
  SUSPENDU: { label: 'Suspendu', variant: 'destructive' },
})

export const statutConfirmationMeta = meta({
  CONFIRME: { label: 'Confirmé', variant: 'success' },
  LISTE_ATTENTE: { label: "Liste d'attente", variant: 'warning' },
  ANNULE: { label: 'Annulé', variant: 'secondary' },
})

export const statutCohorteMeta = meta({
  BROUILLON: { label: 'En planification', variant: 'warning' },
  PROGRAMMEE: { label: 'Programmée', variant: 'success' },
  EN_COURS: { label: 'En cours', variant: 'default' },
  TERMINEE: { label: 'Terminée', variant: 'outline' },
  ANNULEE: { label: 'Annulée', variant: 'destructive' },
})

export const statutActionSocialeMeta = meta({
  PLANIFIE: { label: 'Planifiée', variant: 'secondary' },
  EN_COURS: { label: 'En cours', variant: 'default' },
  TERMINE: { label: 'Terminée', variant: 'outline' },
  ANNULE: { label: 'Annulée', variant: 'destructive' },
  // Anciennes valeurs mal orthographiées écrites en base avant correction du bug
  // de désalignement front/back (voir ActionSociale.STATUT_CHOICES) - gardées
  // ici uniquement pour affichage défensif, ne plus utiliser à l'écriture.
  PLANIFIEE: { label: 'Planifiée', variant: 'secondary' },
  TERMINEE: { label: 'Terminée', variant: 'outline' },
  ANNULEE: { label: 'Annulée', variant: 'destructive' },
})

export function statutEvenementMeta(evenement: { est_termine?: boolean; est_annule?: boolean }) {
  if (evenement.est_annule) return { label: 'Annulé', variant: 'destructive' as BadgeVariant }
  if (evenement.est_termine) return { label: 'Terminé', variant: 'outline' as BadgeVariant }
  return { label: 'En cours', variant: 'default' as BadgeVariant }
}

export const statutParticipationMeta = meta({
  EN_ATTENTE: { label: 'En attente', variant: 'secondary' },
  EN_COURS: { label: 'En cours de suivi', variant: 'default' },
  TERMINE: { label: 'Terminé avec succès', variant: 'success' },
  ABANDON: { label: 'Abandonné', variant: 'destructive' },
})

export const statutGlobalSuiviMeta = meta({
  EN_COURS: { label: 'En cours', variant: 'default' },
  STABLE: { label: 'Stable', variant: 'success' },
  ABANDONNE: { label: 'Abandonné', variant: 'destructive' },
  SUCCES: { label: 'Succès', variant: 'success' },
})

export const typeNotificationMeta = meta({
  INFO: { label: 'Info', variant: 'default' },
  RAPPEL: { label: 'Rappel', variant: 'warning' },
  ALERTE: { label: 'Alerte', variant: 'destructive' },
  SUCCES: { label: 'Succès', variant: 'success' },
})

export const typeEvenementLabel: Record<string, string> = {
  MEETING: 'Meeting',
  CONGRES: 'Congrès',
  AG: 'Assemblée générale',
  REUNION: 'Réunion',
  GALA: 'Gala',
  DISTRIBUTION_MATERIEL: 'Distribution de matériel',
  MISSION_MEDICALE: 'Mission médicale',
  AUTRE: 'Autre',
}

export const typeActionSocialeLabel: Record<string, string> = {
  DON: 'Distribution de dons',
  COMMERCE: 'Aide au commerce',
  ATELIER: 'Atelier',
  MEDICAL: 'Aide médicale',
  AUTRE: 'Autre',
}

export const modeInscriptionLabel: Record<string, string> = {
  OUVERT: 'Ouvert à tous les membres',
  SUR_INSCRIPTION: 'Sur inscription préalable',
  RESTREINT: 'Restreint à une sélection de membres',
}

export const moyenContactLabel: Record<string, string> = {
  VISITE: 'Visite terrain',
  APPEL: 'Appel téléphonique',
  MESSAGE: 'Message / WhatsApp',
}

export const permissionLabel: Record<string, string> = {
  GERER_MEMBRES: 'Gérer les membres',
  GERER_EVENEMENTS: 'Gérer les événements',
  GERER_FORMATIONS: 'Gérer les formations',
  GERER_ACTIONS_SOCIALES: 'Gérer les actions sociales',
  GERER_CONTROLEURS: 'Gérer les contrôleurs',
  VOIR_RAPPORTS: 'Voir les rapports',
  IMPORTER_DONNEES: 'Importer des données',
  GERER_SUIVI: 'Gérer le suivi post-formation',
  GERER_GOUVERNANCE: 'Gérer la gouvernance',
  GERER_COMMUNICATION: 'Gérer la communication',
}

// Fonction du membre au sein d'AP2A - remplace la section géographique
// comme champ d'identité principal (voir Membre.FONCTION_CHOICES côté
// backend). FONCTIONS_DIRECTION sert à dériver l'organigramme depuis
// l'annuaire, sans modèle séparé pour la structure du bureau.
export const fonctionAssociationLabel: Record<string, string> = {
  PRESIDENT: 'Président(e)',
  VICE_PRESIDENT: 'Vice-Président(e)',
  SECRETAIRE_GENERAL: 'Secrétaire Général(e)',
  TRESORIER: 'Trésorier(ère)',
  MEMBRE_BUREAU_EXECUTIF: 'Membre du Bureau Exécutif',
  COORDINATEUR_COMMISSION: 'Coordinateur/trice de Commission',
  AMBASSADEUR: 'Ambassadeur/drice',
  MEMBRE_ACTIF: 'Membre Actif',
  MEMBRE_HONNEUR: "Membre d'Honneur",
}

export const FONCTIONS_DIRECTION = [
  'PRESIDENT', 'VICE_PRESIDENT', 'SECRETAIRE_GENERAL',
  'TRESORIER', 'MEMBRE_BUREAU_EXECUTIF',
]
