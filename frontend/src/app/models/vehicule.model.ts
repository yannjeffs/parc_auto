export type TypeVehicule = 'berline' | 'suv' | 'utilitaire' | 'camion' | 'moto' | 'bus';
export type TypeCarburant = 'essence' | 'diesel' | 'hybride' | 'electrique';
export type StatutVehicule =
  | 'en_service'
  | 'en_maintenance'
  | 'en_panne'
  | 'hors_service'
  | 'vendu';

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
  caracteristiques: Record<string, unknown>;
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
