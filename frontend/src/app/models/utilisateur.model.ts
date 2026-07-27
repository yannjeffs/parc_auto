export type Role = 'admin' | 'gestionnaire' | 'lecture_seule' | 'conducteur';

export interface Utilisateur {
  id: number;
  username : string;
  email: string;
  is_active: boolean;
  role: Role;
  date_joined: string;
  last_login : string | null;
}
