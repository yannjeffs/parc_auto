export type CategoriePermis = 'A' | 'B' | 'C' | 'D' | 'EB';
export type StatutConducteur = 'disponible' | 'en_mission' | 'en_conge' | 'suspendu';

export interface Conducteur {
  id: string;
  utilisateur: number | null;
  nom: string;
  prenom: string;
  telephone: string;
  numero_permis: string;
  categorie_permis: CategoriePermis;
  date_expiration_permis: string;
  permis_valide: boolean;
  date_embauche: string;
  statut: StatutConducteur;
  photo: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
