export type TypeDocument = 'assurance' | 'visite_technique' | 'carte_grise' | 'vignette' | 'autre';

export interface DocumentVehicule {
  id: string;
  vehicule: string;
  vehicule_immatriculation: string;
  type_document: TypeDocument;
  numero_document: string;
  date_emission: string;
  date_expiration: string | null;
  fichier: string | null;
  est_valide: boolean;
  jours_avant_expiration: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
