export type TypeMaintenance = 'preventive' | 'curative';
export type StatutMaintenance = 'planifiee' | 'en_cours' | 'terminee' | 'annulee';

export interface Maintenance {
  id: string;
  vehicule: string;
  vehicule_immatriculation: string;
  type_maintenance: TypeMaintenance;
  statut: StatutMaintenance;
  description: string;
  date_intervention: string;
  kilometrage_intervention: number;
  cout: string; // DecimalField -> string
  prestataire: string;
  prochaine_echeance_date: string | null;
  prochaine_echeance_km: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
