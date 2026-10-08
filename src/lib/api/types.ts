// Types miroir du contrat API backend (adhesion/*). Les noms de champs
// respectent exactement ceux renvoyés par le backend (snake_case côté API).

export type PermissionCode =
  | 'GERER_MEMBRES'
  | 'GERER_EVENEMENTS'
  | 'GERER_FORMATIONS'
  | 'GERER_ACTIONS_SOCIALES'
  | 'GERER_CONTROLEURS'
  | 'VOIR_RAPPORTS'
  | 'IMPORTER_DONNEES'
  | 'GERER_SUIVI'
  | 'GERER_GOUVERNANCE'
  | 'GERER_COMMUNICATION'
  | 'GERER_REFERENTIELS'
  | 'DONNEES_MEDICALES'

export interface CurrentUser {
  jeton: string
  nom: string
  prenom: string
  est_admin: boolean
  est_super_admin: boolean
  est_membre: boolean
  est_controleur: boolean
  doit_changer_mot_de_passe: boolean
  permissions: PermissionCode[]
}

export type StatutAdhesion = 'ACTIF' | 'SUSPENDU' | 'EXPIRE'
export type StatutCarte = 'ACTIVE' | 'BLOQUEE' | 'PERDUE'
export type StatutCompte = 'ACTIF' | 'SUSPENDU'

export interface Section {
  id_section: number
  nom_section: string
  ville: string
}

export type FonctionAssociation =
  | 'PRESIDENT' | 'VICE_PRESIDENT' | 'SECRETAIRE_GENERAL' | 'TRESORIER'
  | 'MEMBRE_BUREAU_EXECUTIF' | 'COORDINATEUR_COMMISSION' | 'AMBASSADEUR'
  | 'MEMBRE_ACTIF' | 'MEMBRE_HONNEUR'

export interface MembreListItem {
  id_membre: number
  nom: string
  prenom: string
  numero_adherent: string
  statut_adhesion: StatutAdhesion
  fonction_association: FonctionAssociation
  fonction_association_libelle: string
  section: string | null
  id_carte: number | null
  statut_carte: StatutCarte | null
}

export interface MembreDetail {
  id_membre: number
  nom: string
  prenom: string
  email: string
  telephone: string | null
  numero_adherent: string
  fonction_association: FonctionAssociation
  fonction_association_libelle: string
  section: string | null
  id_section: number | null
  date_adhesion: string
  statut_adhesion: StatutAdhesion
  est_admin: boolean
  est_admin_principal: boolean
  est_controleur: boolean
  id_carte_active: number | null
  statut_carte: StatutCarte | null
  nombre_participations: number
  historique_cartes: Array<{ id_carte: number; type_carte: string; statut_carte: StatutCarte; date_emission: string }>
}

export interface Controleur {
  id_controleur: number
  nom: string
  prenom: string
  email: string
  zone_affectation: string | null
  date_nomination: string
  statut_compte: StatutCompte
  est_aussi_membre: boolean
  evenement_assigne: { id_evenement: number; titre: string } | null
}

export interface CompteRecherche {
  id_compte: number
  email: string
  nom: string
  prenom: string
  est_membre: boolean
  est_controleur: boolean
  est_admin: boolean
}

export interface AdminListItem {
  id_compte: number
  nom: string
  prenom: string
  email: string
  est_admin_principal: boolean
}

export interface Seance {
  id_seance: number
  numero_ordre: number
  date_seance: string
}

export type TypeEvenement =
  | 'MEETING' | 'CONGRES' | 'AG' | 'REUNION' | 'GALA'
  | 'DISTRIBUTION_MATERIEL' | 'MISSION_MEDICALE' | 'AUTRE'
export type ModeInscription = 'OUVERT' | 'SUR_INSCRIPTION' | 'RESTREINT'
export type StatutConfirmation = 'CONFIRME' | 'LISTE_ATTENTE' | 'ANNULE'

export interface EvenementListItem {
  id_evenement: number
  titre: string
  lieu: string
  type_evenement: TypeEvenement
  description?: string | null
  mode_inscription?: ModeInscription
  capacite_max?: number | null
  est_termine?: boolean
  est_annule?: boolean
  nombre_seances: number
}

export interface EvenementMembre {
  id_evenement: number
  titre: string
  lieu: string
  type_evenement: TypeEvenement
  description: string | null
  mode_inscription: ModeInscription
  capacite_max: number | null
  est_termine?: boolean
  est_annule?: boolean
  seances: Seance[]
  mon_statut: StatutConfirmation | null
}

export interface EvenementDetail {
  id_evenement: number
  titre: string
  lieu: string
  type_evenement: TypeEvenement
  description: string | null
  mode_inscription: ModeInscription
  capacite_max: number | null
  statut?: string
  est_termine: boolean
  est_annule: boolean
  date_fin: string | null
  nombre_seances: number
  organisateur: string
  total_participants: number
  /** Clé = code méthode de scan (QR/NFC/MANUEL), valeur = nombre de scans. */
  repartition_methode: Record<string, number>
  /** Clé = "Séance N", valeur = nombre de présences sur cette séance. */
  repartition_seances: Record<string, number>
  participants: Array<{
    nom: string
    prenom: string
    numero_adherent: string
    seance: number
    heure_arrivee: string
    methode_scan: string
    controleur: string
  }>
}

export interface Confirmation {
  id_confirmation: number
  membre: string
  numero_adherent: string
  statut: StatutConfirmation
  date_confirmation: string
}

export interface InviteExterne {
  id_invite: number
  nom: string
  prenom: string
  telephone: string | null
  organisation: string | null
}

export interface Formation {
  id_formation: number
  titre: string
  code_reference: string | null
  description: string | null
  domaine: string | null
  duree_heures: number | null
  prerequis: string | null
  nombre_cohortes: number
}

export type StatutCohorte = 'BROUILLON' | 'PROGRAMMEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE'
export type PublicCibleType = 'TOUS' | 'SPECIFIQUE'

export interface CohorteListItem {
  id_cohorte: number
  code_cohorte: string
  date_debut: string
  date_fin: string
  lieu: string
  formateur: string | null
  statut: StatutCohorte
  nombre_inscrits: number
  capacite_max: number | null
  est_payante: boolean
  prix: string | null
  date_limite_inscription: string | null
  /** % de présence minimum pour le certificat (défaut 75, non modifiable actuellement). */
  seuil_certification: number
  public_cible_type: PublicCibleType
  contenu_kit?: string | null
}

export interface CohorteDetail {
  id_cohorte: number
  code_cohorte: string
  formation: string
  statut: StatutCohorte
  /** true si statut = TERMINEE ou ANNULEE : toute modification est refusée côté backend. */
  verrouillee: boolean
  lieu: string
  formateur: string | null
  nombre_seances: number
  nombre_participants: number
  taux_assiduite: number
  capacite_max: number | null
  capacite_min: number | null
  materiel_necessaire: string | null
  contenu_kit?: string | null
  est_payante: boolean
  prix: string | null
  prix_adherent: string | null
  date_limite_inscription: string | null
  conditions_annulation: string | null
  financeur: string | null
  numero_convention: string | null
  seuil_certification: number
  public_cible_type: PublicCibleType
  participants: Array<{
    id_participant: number
    nom: string
    prenom: string
    source: string
    a_un_compte: boolean
    statut: string
    kit_distribue?: boolean
    certificat_delivre?: boolean
  }>
  /** Clé = "Séance N", valeur = nombre de présences sur cette séance. */
  presence_par_seance: Record<string, number>
}

export interface SeanceCohorte {
  id_seance_cohorte: number
  numero_ordre: number
  date_seance: string
  heure_fin: string | null
  lieu: string | null
  titre_seance: string | null
  type_seance: string | null
  formateur_seance: string | null
}

export interface MesCohortes {
  id_cohorte: number
  code_cohorte: string
  formation: string
  date_debut: string
  date_fin: string
  statut_cohorte: StatutCohorte
  statut_inscription: string
  taux_presence?: number
  kit_distribue?: boolean
  certificat_url?: string
}

export interface ParticipantCohorteListItem {
  id_inscription: number
  id_participant: number
  nom: string
  prenom: string
  telephone: string | null
  numero_carte_identite: string | null
  numero_badge: string
  photo: string | null
  source: string
  statut: string
  a_un_compte: boolean
  taux_presence: number
  kit_distribue: boolean
  date_distribution_kit: string | null
  certificat_delivre?: boolean
  date_emission_certificat?: string | null
}

export interface ParticipantDetail {
  id_participant: number
  nom: string
  prenom: string
  telephone: string | null
  numero_badge: string
  badge: string
  photo: string | null
  a_un_compte: boolean
  formations: Array<{ id_cohorte: number; code_cohorte: string; formation: string }>
}

export type TypeActionSociale = 'DON' | 'COMMERCE' | 'ATELIER' | 'MEDICAL' | 'AUTRE'
export type StatutActionSociale = 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE'

export interface CreerMembreAdminPayload {
  nom: string
  prenom: string
  fonction_association: FonctionAssociation
  id_section?: number
  email?: string
  telephone?: string
  mode: 'MANUEL' | 'EMAIL'
  mot_de_passe?: string
}

export interface CreerMembreAdminResponse {
  id_membre: number
  numero_adherent: string
  email: string
  mot_de_passe_temporaire: string | null
  email_envoye: boolean
  mode: string
}

export interface ActionSocialeListItem {
  id_action: number
  titre: string
  type_action: TypeActionSociale
  type_action_libelle: string
  description: string | null
  lieu: string | null
  date_debut: string
  date_fin: string | null
  statut: StatutActionSociale
  contenu_don?: string | null
  nb_beneficiaires: number
  organisateur: string
}

export interface ActionSocialeDetail {
  id_action: number
  titre: string
  type_action: TypeActionSociale
  type_action_libelle: string
  description: string | null
  lieu: string | null
  date_debut: string
  date_fin: string | null
  statut: StatutActionSociale
  contenu_don?: string | null
  organisateur: string
  beneficiaires: Array<{
    id_beneficiaire: number
    id_participation: number
    nom: string
    prenom: string
    telephone: string | null
    sexe: string | null
    date_naissance: string | null
    numero_identification: string | null
    adresse: string | null
    statut: string
    notes: string | null
    type_aide_recue: string | null
    don_recu?: boolean
    date_reception_don?: string | null
    detail_medical?: {
      a_ete_visite: boolean
      date_visite: string | null
      necessite_traitement: boolean
      description_besoin_traitement: string
      traitement_effectue: boolean
      date_traitement: string | null
      notes_suivi: string
    } | null
    /** Vrai quand un détail médical existe mais n'est pas visible (permission DONNEES_MEDICALES). */
    detail_medical_masque?: boolean
  }>
}

export type MoyenContact = 'VISITE' | 'APPEL' | 'MESSAGE'
export type StatutGlobalSuivi = 'EN_COURS' | 'STABLE' | 'ABANDONNE' | 'SUCCES'

export interface SuiviParticipant {
  id_participant: number
  nom: string
  prenom: string
  telephone: string | null
  nb_suivis: number
  /** Résumé minimal du dernier suivi (pas le même détail que SuiviDetail). */
  dernier_suivi: {
    date: string
    statut: StatutGlobalSuivi
    kit_remis: boolean
    certificat_emis: boolean
    activite_lancee: boolean
  } | null
}

export interface SuiviDetail {
  id_suivi: number
  cohorte: string
  formation: string
  date_suivi: string
  effectue_par: string
  moyen_contact: MoyenContact
  kit_remis: boolean
  certificat_emis: boolean
  activite_lancee: boolean
  type_activite: string | null
  difficultes: string | null
  niveau_satisfaction: number | null
  statut_global: StatutGlobalSuivi
  recommandations: string | null
}

export type TypeNotification = 'INFO' | 'RAPPEL' | 'ALERTE' | 'SUCCES'

export interface NotificationItem {
  id_notification: number
  titre: string
  corps: string
  type: TypeNotification
  lu: boolean
  date_creation: string
  lien_action: string | null
}

export interface RepartitionParFonction {
  fonction_association: string
  fonction_association_libelle: string
  nombre: number
}

export interface DashboardStats {
  date_mise_a_jour: string
  membres: { actifs: number; total: number; nouveaux_7j: number }
  evenements: { a_venir: number; en_cours_aujourdhui: number }
  formations: { cohortes_en_cours: number; participants_actifs: number }
  actions_sociales: { en_cours: number; beneficiaires_total: number }
  notifications_non_lues: number
  repartition_par_fonction: RepartitionParFonction[]
  impact: {
    beneficiaires_aides_total: number
    formations_terminees_total: number
    kits_distribues_total: number
    taux_reussite_suivi: number | null
  }
}

export interface Statistiques {
  total_membres: number
  membres_actifs: number
  repartition_par_section: Array<{ section__nom_section: string | null; nombre: number }>
  repartition_par_fonction: RepartitionParFonction[]
}

export interface JournalEntry {
  type_action: string
  date_action: string
  description: string
  auteur: string
}

export interface JournalPage {
  total: number
  page: number
  taille_page: number
  nombre_pages: number
  resultats: JournalEntry[]
}

export interface ConfigAssociation {
  cotisation_active: boolean
  montant_cotisation_annuel: string | null
  seuil_certification_defaut: number
  duree_suivi_defaut_jours: number
  nom_association: string
  slogan: string | null
  email_contact: string | null
  telephone_contact: string | null
  logo: string | null
}

export interface MonProfilCompte {
  nom: string
  prenom: string
  email: string
  telephone: string | null
  est_membre: boolean
  photo: string | null
}

export interface MonProfilMembre {
  nom: string
  prenom: string
  numero_adherent: string
  section: string | null
  date_adhesion: string
  statut_adhesion: StatutAdhesion
  photo: string | null
  /**
   * Carte virtuelle QR : toujours présente, indépendante de la carte physique.
   * Son contenu n'est disponible qu'en QR rotatif (`cartesApi.qrActuel`).
   */
  carte_qr: {
    statut_carte: StatutCarte
  }
  /** Carte physique NFC remise par l'association : peut être absente. */
  carte_physique: {
    type_carte: 'NFC'
    statut_carte: StatutCarte
  } | null
}

export interface HistoriqueParticipation {
  titre: string
  lieu: string
  numero_seance: number
  date_seance: string
  heure_arrivee: string
  methode_scan: string
}

export interface ScanControleAcces {
  type: 'evenement' | 'formation'
  personne: string
  contexte: string
  controleur: string
  methode_scan: string
  heure_arrivee: string
}

export interface HistoriqueScanControleur {
  membre: string
  numero_adherent: string
  evenement: string
  numero_seance: number
  heure_arrivee: string
  methode_scan: string
}

export type TypeCibleKit = 'FORMATION' | 'COHORTE' | 'PARTICIPANTS'

export interface DestinataireKit {
  id_participant: number
  nom: string
  prenom: string
  distribue: boolean
  date_distribution: string | null
  remis_par: string | null
}

export interface LigneDistributionKit {
  id_kit: number
  nom_kit: string
  id_participant: number
  nom: string
  prenom: string
  distribue: boolean
  date_distribution: string | null
  remis_par: string | null
}

export interface Kit {
  id_kit: number
  nom: string
  contenu: string
  type_cible: TypeCibleKit
  formation: { id_formation: number; titre: string } | null
  cohorte: { id_cohorte: number; code_cohorte: string } | null
  participants_cibles: Array<{ id_participant: number; nom: string; prenom: string }>
  cree_par: string | null
  date_creation: string
}

export interface MembreAnnuaire {
  id_membre: number
  nom: string
  prenom: string
  photo: string | null
  fonction_association: FonctionAssociation
  fonction_association_libelle: string
  est_direction: boolean
  section: string | null
}

export interface CompteRendu {
  id_compte_rendu: number
  titre: string
  date_reunion: string
  contenu: string
  decisions: string | null
  cree_par: string
  date_creation: string
}

// =========================================================================
// Référentiels du suivi des actions
// =========================================================================

export type NiveauZone = 'REGION' | 'DEPARTEMENT' | 'COMMUNE' | 'QUARTIER'

export interface Zone {
  id_zone: number
  nom: string
  niveau: NiveauZone
  parent: number | null
  actif: boolean
  chemin: string
  nombre_sous_zones: number
}

export type TypePartenaire =
  | 'ONG'
  | 'ETAT'
  | 'COLLECTIVITE'
  | 'SANTE'
  | 'FORMATION'
  | 'ENTREPRISE'
  | 'BAILLEUR'
  | 'COMMUNAUTAIRE'
  | 'AUTRE'

export interface Partenaire {
  id_partenaire: number
  nom: string
  sigle: string
  type_partenaire: TypePartenaire
  domaines: string
  nom_contact: string
  telephone: string
  email: string
  adresse: string
  zone: number | null
  zone_chemin: string | null
  notes: string
  actif: boolean
  date_creation: string
}

export type TypeCible = 'PERSONNE' | 'GROUPE' | 'ASC' | 'ETABLISSEMENT' | 'ORGANISATION' | 'ZONE_SINISTREE'

export type CategorieAction =
  | 'FORMATION'
  | 'EDUCATION'
  | 'SANTE'
  | 'URGENCE'
  | 'ECONOMIE'
  | 'SOCIAL'
  | 'INFRASTRUCTURE'
  | 'AUTRE'

export type TypeValeurIndicateur =
  | 'ENTIER'
  | 'DECIMAL'
  | 'MONTANT'
  | 'POURCENTAGE'
  | 'BOOLEEN'
  | 'CHOIX'
  | 'TEXTE'
  | 'DATE'

export type MomentIndicateur = 'REFERENCE' | 'INTERVENTION' | 'SUIVI'
export type NiveauIndicateur = 'CIBLE' | 'ACTION'

export interface DefinitionIndicateur {
  id_indicateur: number
  type_action: number
  code: string
  libelle: string
  description: string
  type_valeur: TypeValeurIndicateur
  unite: string
  choix: string[]
  moment: MomentIndicateur
  niveau: NiveauIndicateur
  obligatoire: boolean
  sensible: boolean
  ordre: number
  actif: boolean
}

export interface TypeAction {
  id_type_action: number
  code: string
  libelle: string
  description: string
  categorie: CategorieAction
  types_cible: TypeCible[]
  est_formation: boolean
  actif: boolean
  indicateurs: DefinitionIndicateur[]
}
