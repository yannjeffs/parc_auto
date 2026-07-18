export interface PleinCarburant {
  id: string;
  vehicule: string;
  conducteur: string | null;
  date_plein: string;
  litres: string;
  cout_total: string;
  prix_par_litre: string;
  kilometrage_au_plein: number;
  station: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
