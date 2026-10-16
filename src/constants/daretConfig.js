/**
 * 🏦 Configuration & Constantes - Daret
 * 
 * Fichier centralisé pour les paramètres de la Daret
 * Modifiez ces valeurs selon vos besoins
 */

// ============================================
// CONFIGURATION GÉNÉRALE
// ============================================

/**
 * Paramètres par défaut pour une nouvelle Daret
 */
export const DARET_DEFAULTS = {
  monthlyAmount: 500,           // Montant par défaut (DH)
  minMonthlyAmount: 50,         // Montant minimum
  maxMonthlyAmount: 10000,      // Montant maximum
  minMembers: 2,                // Minimum de membres
  maxMembers: 20,               // Maximum de membres
  cycleDays: 30,                // Jours entre chaque tour
};

/**
 * Durée des cycles de rotation (jours)
 * Par défaut : 30 jours = 1 mois
 */
export const ROTATION_CYCLE_DAYS = 30;

/**
 * Nombre de jours avant considérer en retard
 * Par défaut : 3 jours après la date limite
 */
export const OVERDUE_THRESHOLD_DAYS = 3;

// ============================================
// STATUTS
// ============================================

export const DARET_STATUS = {
  ACTIVE: 'active',       // 🟢 Active
  PAUSED: 'paused',       // ⏸️ Pausée
  COMPLETED: 'completed', // ✅ Complétée
};

export const MEMBER_STATUS = {
  ACTIVE: 'active',       // Membre actif
  INACTIVE: 'inactive',   // Membre inactif (retiré)
};

export const CONTRIBUTION_STATUS = {
  PAID: 'paid',           // ✅ Payé
  PENDING: 'pending',     // ⏳ En attente
  OVERDUE: 'overdue',     // ⚠️ En retard
};

// ============================================
// MESSAGES & TEXTES
// ============================================

export const MESSAGES = {
  // Création
  CREATE_SUCCESS: 'Daret créée avec succès!',
  CREATE_ERROR: 'Erreur lors de la création',
  
  // Suppression
  DELETE_CONFIRM: 'Êtes-vous sûr de vouloir supprimer cette Daret?',
  DELETE_SUCCESS: 'Daret supprimée',
  DELETE_ERROR: 'Erreur lors de la suppression',
  
  // Membres
  MEMBER_ADDED: 'Membre ajouté',
  MEMBER_REMOVED: 'Membre retiré',
  MEMBER_NAME_REQUIRED: 'Le nom du membre est requis',
  
  // Tours
  ROUND_COMPLETED: 'Tour enregistré',
  ROUND_ERROR: 'Erreur lors de l\'enregistrement',
  
  // Erreurs de validation
  NAME_REQUIRED: 'Le nom de la Daret est requis',
  AMOUNT_REQUIRED: 'Le montant est requis',
  AMOUNT_INVALID: 'Le montant doit être supérieur à 0',
  MEMBERS_REQUIRED: 'Au moins 2 membres sont requis',
  
  // Statuts
  ACTIVE: '🟢 Actif',
  PAUSED: '⏸️ Pausé',
  COMPLETED: '✅ Complété',
  OVERDUE: '⚠️ En retard',
};

// ============================================
// LABELS & TEXTES D'AFFICHAGE
// ============================================

export const LABELS = {
  // Navigation
  TAB_TITLE: 'Darets',
  DARET_LIST: 'Mes Darets',
  CREATE_DARET: 'Créer une Daret',
  DARET_DETAILS: 'Détails',
  
  // Formulaire
  NAME_LABEL: 'Nom de la Daret',
  AMOUNT_LABEL: 'Montant par mois (DH)',
  MEMBERS_LABEL: 'Membres',
  ADD_MEMBER: 'Ajouter un membre',
  
  // Affichage
  MONTHLY_AMOUNT: 'Montant/mois',
  MONTHLY_POOL: 'Pot mensuel',
  MEMBERS_COUNT: 'Membres',
  CURRENT_ROUND: 'Tour actuel',
  NEXT_BENEFICIARY: 'Prochain bénéficiaire',
  MARK_AS_RECEIVED: 'Marquer comme reçu',
  
  // Stats
  TOTAL_CONTRIBUTED: 'Total versé',
  ROUNDS_COMPLETED: 'Tours complétés',
  TIMES_RECEIVED: 'Fois reçu',
  
  // Actions
  PAUSE: 'Pauser',
  RESUME: 'Reprendre',
  DELETE: 'Supprimer',
  EDIT: 'Modifier',
  SHARE: 'Partager',
};

// ============================================
// COULEURS SPÉCIFIQUES DARET
// ============================================

export const DARET_COLORS = {
  // Statuts
  statusActive: '#10b981',        // Vert (actif)
  statusPaused: '#f59e0b',        // Orange (pausé)
  statusCompleted: '#3b82f6',     // Bleu (complété)
  statusOverdue: '#dc2626',       // Rouge (retard)
  
  // Contributions
  paid: '#10b981',                // Vert (payé)
  pending: '#f59e0b',             // Orange (en attente)
  overdue: '#dc2626',             // Rouge (retard)
  
  // Backgrounds
  bgActive: '#f0fdf4',            // Vert très clair
  bgPaused: '#fef3c7',            // Orange très clair
  bgCompleted: '#eff6ff',         // Bleu très clair
  bgOverdue: '#fef2f2',           // Rouge très clair
};

// ============================================
// SEUILS & LIMITES
// ============================================

export const THRESHOLDS = {
  // Alerte: nombre de jours avant la date limite
  warningDaysBefore: 7,           // ⚠️ 7 jours avant
  
  // Retard: nombre de jours après la date limite
  overdueAfterDays: 3,            // 🔴 3 jours après = retard
  
  // Très en retard
  veryOverdueAfterDays: 14,       // 🔴🔴 2 semaines après
  
  // Historique à afficher par défaut
  maxHistoryShown: 12,            // Afficher les 12 derniers tours
};

// ============================================
// NOTIFICATIONS
// ============================================

export const NOTIFICATIONS = {
  REMINDER_TITLE: 'Rappel Daret',
  REMINDER_BODY: (daretName, memberName, amount) =>
    `${daretName}: ${memberName} doit recevoir ${amount} DH`,
  
  OVERDUE_TITLE: '⚠️ Daret en retard',
  OVERDUE_BODY: (daretName, days) =>
    `${daretName} est en retard de ${days} jour(s)`,
  
  COMPLETED_TITLE: '✅ Tour complété',
  COMPLETED_BODY: (recipientName, amount) =>
    `${recipientName} a reçu ${amount} DH`,
};

// ============================================
// EXPORT & FORMAT
// ============================================

export const EXPORT_FORMATS = {
  CSV: 'csv',
  PDF: 'pdf',
  JSON: 'json',
};

export const CSV_HEADERS = [
  'Daret',
  'Montant/mois',
  'Membres',
  'Tours complétés',
];

export const CSV_ROUND_HEADERS = [
  'Tour',
  'Bénéficiaire',
  'Total',
  'Montant',
  'Date Prévue',
  'Date Reçue',
];

// ============================================
// VALIDATION
// ============================================

export const VALIDATION = {
  // Regex
  nameRegex: /^[\p{L}\s'-]+$/u,   // Accepte les lettres avec accents
  amountRegex: /^\d+(\.\d{1,2})?$/, // Nombres décimaux
  
  // Limites de texte
  nameMaxLength: 50,
  descriptionMaxLength: 500,
  
  // Patterns
  minNameLength: 2,
  maxNameLength: 50,
};

// ============================================
// PERSISTENCE
// ============================================

export const STORAGE_KEYS = {
  BASE: 'darets',
  USER_PREFIX: (userId) => `darets_${userId}`,
};

// ============================================
// DATES & FORMATS
// ============================================

export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',            // "01/02/2025"
  LONG: 'dd MMMM yyyy',           // "01 février 2025"
  FULL: 'EEEE dd MMMM yyyy',      // "samedi 01 février 2025"
  TIME: 'HH:mm',                  // "14:30"
  ISO: "yyyy-MM-dd'T'HH:mm:ss'Z'", // ISO standard
};

export const LOCALE = 'fr-FR';

// ============================================
// STATISTIQUES & ANALYTICS
// ============================================

export const ANALYTICS_EVENTS = {
  DARET_CREATED: 'daret_created',
  DARET_DELETED: 'daret_deleted',
  DARET_PAUSED: 'daret_paused',
  DARET_RESUMED: 'daret_resumed',
  ROUND_COMPLETED: 'round_completed',
  MEMBER_ADDED: 'member_added',
  MEMBER_REMOVED: 'member_removed',
};

// ============================================
// AMÉLIORATIONS FUTURES
// ============================================

/**
 * Flags pour les futures fonctionnalités
 * À activer progressivement
 */
export const FEATURE_FLAGS = {
  // Phase 2
  NOTIFICATIONS_ENABLED: false,   // Notifications push
  PDF_EXPORT_ENABLED: false,      // Export PDF
  CLOUD_SYNC_ENABLED: false,      // Sync Firebase
  
  // Phase 3
  APPROVALS_ENABLED: false,       // System d'approbation
  DIGITAL_SIGNATURES: false,      // Signatures numériques
  AUDIT_LOG_ENABLED: false,       // Log d'audit complet
  
  // Phase 4
  GROUPS_ENABLED: false,          // Groupes multi-darets
  REMITTANCE_ENABLED: false,      // Virements intégrés
  ANALYTICS_ENABLED: false,       // Analytics avancées
};

// ============================================
// PRESETS & TEMPLATES
// ============================================

/**
 * Templates prédéfinis pour créer rapidement une Daret
 */
export const DARET_TEMPLATES = {
  FAMILY: {
    name: 'Daret Famille',
    monthlyAmount: 500,
    description: 'Épargne collective en famille',
  },
  FRIENDS: {
    name: 'Daret Amis',
    monthlyAmount: 300,
    description: 'Tontine entre copains',
  },
  COLLEAGUES: {
    name: 'Daret Travail',
    monthlyAmount: 400,
    description: 'Épargne collective au travail',
  },
  COMMUNITY: {
    name: 'Daret Communauté',
    monthlyAmount: 200,
    description: 'Projet d\'épargne communautaire',
  },
};

// ============================================
// CALCULS & FORMULES
// ============================================

/**
 * Calcul du cycle total en jours
 * @param {number} monthsToWait combien de mois avant de recevoir
 * @returns {number} jours
 */
export const calculateCycleDurationDays = (membersCount) => {
  return ROTATION_CYCLE_DAYS * membersCount;
};

/**
 * Calcul du montant total par tour
 * @param {number} monthlyAmount montant par personne
 * @param {number} membersCount nombre de membres
 * @returns {number} montant total
 */
export const calculateTotalPerRound = (monthlyAmount, membersCount) => {
  return monthlyAmount * membersCount;
};

/**
 * Calcul du montant total après N tours
 * @param {number} monthlyAmount montant par personne
 * @param {number} membersCount nombre de membres
 * @param {number} roundsCompleted tours complétés
 * @returns {number} montant total
 */
export const calculateTotalAfterRounds = (monthlyAmount, membersCount, roundsCompleted) => {
  return monthlyAmount * membersCount * roundsCompleted;
};

export default {
  DARET_DEFAULTS,
  ROTATION_CYCLE_DAYS,
  OVERDUE_THRESHOLD_DAYS,
  DARET_STATUS,
  MEMBER_STATUS,
  CONTRIBUTION_STATUS,
  MESSAGES,
  LABELS,
  DARET_COLORS,
  THRESHOLDS,
  NOTIFICATIONS,
  VALIDATION,
  STORAGE_KEYS,
  DATE_FORMATS,
  FEATURE_FLAGS,
  DARET_TEMPLATES,
};
