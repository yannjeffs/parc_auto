export interface Affectation {
  id: string;
  vehicule: string;
  conducteur: string;
  conducteur_nom: string;
  date_debut: string;
  date_fin: string | null;
  motif: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
