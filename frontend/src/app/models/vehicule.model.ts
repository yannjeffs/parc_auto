export type TypeVehicule = 'berline' | 'suv' | 'utilitaire' | 'camion' | 'moto' | 'bus';
export type TypeCarburant = 'essence' | 'diesel' | 'hybride' | 'electrique';
export type StatutVehicule =
  | 'en_service'
  | 'en_maintenance'
  | 'en_panne'
  | 'hors_service'
  | 'vendu';

export type TypeTransmission = 'Manuelle' | 'Automatique';
export type TypeTraction = 'FWD' | 'RWD' | '4x4' | 'AWD';

export interface Caracteristiques {
  transmission?: TypeTransmission;
  traction?: TypeTraction;
  puissance_ch?: number;
  [key: string]: unknown;
}

export interface Vehicule {
  id: string;
  immatriculation: string;
  numero_chassis: string;
  marque: string;
  modele: string;
  annee: number;
  type_vehicule: TypeVehicule;
  type_carburant: TypeCarburant;
  cylindree_cm3: number | null;
  nombre_places: number;
  caracteristiques: Caracteristiques;
  statut: StatutVehicule;
  kilometrage_actuel: number;
  site_affectation: string;
  date_acquisition: string; // ISO date
  // Les DecimalField DRF sont sérialisés en string par défaut (précision préservée)
  prix_acquisition: string;
  valeur_actuelle_estimee: string | null;
  photo: string | null;
  conducteur_actuel: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Version allégée renvoyée par l'endpoint de liste (VehiculeListSerializer) */
export interface VehiculeListItem {
  id: string;
  immatriculation: string;
  marque: string;
  modele: string;
  statut: StatutVehicule;
  kilometrage_actuel: number;
  photo: string | null;
}
