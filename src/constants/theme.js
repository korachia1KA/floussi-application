import {
  AlertTriangle,
  Coffee,
  Database,
  Droplets,
  Flame, Fuel,
  Gift,
  GraduationCap,
  Heart,
  Home,
  MoreHorizontal,
  PiggyBank,
  Plane,
  Scissors,
  Shirt,
  Utensils,
  Wifi,
  Wrench
} from 'lucide-react-native';

export const CATEGORIES = [
  { id: 'nourriture', name: 'Nourriture', icon: Utensils, color: '#f97316', bg: '#ffedd5', defaultLimit: 3000 },
  { id: 'ecole', name: 'École', icon: GraduationCap, color: '#3b82f6', bg: '#dbeafe', defaultLimit: 1200 },
  { id: 'loyer', name: 'Loyer', icon: Home, color: '#6366f1', bg: '#e0e7ff', defaultLimit: 3500 },
  { id: 'gaz', name: 'Gaz', icon: Flame, color: '#eab308', bg: '#fef9c3', defaultLimit: 100 },
  { id: 'parents', name: 'Parents', icon: Fuel, color: '#78716c', bg: '#e7e5e4', defaultLimit: 500 },
  { id: 'loisirs', name: 'Resto/Sortie', icon: Coffee, color: '#ec4899', bg: '#fce7f3', defaultLimit: 1000 },
  { id: 'vetements', name: 'Vêtements', icon: Shirt, color: '#8b5cf6', bg: '#ede9fe', defaultLimit: 400 },
  { id: 'autres', name: 'Coiffeur/Hammam', icon: Scissors, color: '#14b8a6', bg: '#ccfbf1', defaultLimit: 800 },
  { id: 'femme', name: 'Femme perso', icon: Heart, color: '#be185d', bg: '#fce7f3', defaultLimit: 1000 },
  { id: 'famille', name: 'Famille cadeaux', icon: Gift, color: '#f43f5e', bg: '#ffe4e6', defaultLimit: 500 },
  { id: 'eau_elec', name: 'Eau + Électricité', icon: Droplets, color: '#0ea5e9', bg: '#e0f2fe', defaultLimit: 450 },
  { id: 'telecom', name: 'Télécom', icon: Wifi, color: '#64748b', bg: '#f1f5f9', defaultLimit: 350 },
  { id: 'voyage', name: 'Voyage', icon: Database, color: '#d97706', bg: '#fef3c7', defaultLimit: 600 },
  { id: 'eid_voyage', name: 'Eids ', icon: Plane, color: '#84cc16', bg: '#d9f99d', defaultLimit: 1400 },
  { id: 'auto_ent', name: 'Auto Entretien', icon: Wrench, color: '#475569', bg: '#f1f5f9', defaultLimit: 500 },
  { id: 'imprevus', name: 'Imprévus', icon: AlertTriangle, color: '#ef4444', bg: '#fee2e2', defaultLimit: 1000 },
  { id: 'divers', name: 'Autre',  icon: MoreHorizontal, color: '#94a3b8', bg: '#f1f5f9', defaultLimit: 500 },
];

export const COLORS = {
  primary: '#006233', // 🟢 VERT MAROCAIN (Devient la couleur principale)
  secondary: '#c1272d', // 🔴 ROUGE MAROCAIN (Pour les accents)
  danger: '#ef4444',
  success: '#10b981'
};