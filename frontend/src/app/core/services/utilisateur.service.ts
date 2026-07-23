import { Injectable } from '@angular/core';
import { Role, Utilisateur } from '../../models/utilisateur.model';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../../models/auth.model';

export interface UtilisateurCreatePayload {
  username: string;
  email?: string;
  password: string;
  role_saisi: Role;
}

export interface UtilisateurUpdatePayload {
  email?: string;
  is_active?: boolean;
  password?: string;
  role_saisi?: Role;
}

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private readonly baseUrl = `${environment.apiUrl}/utilisateurs/`;

  constructor(private http: HttpClient) {}

  list(): Observable<PaginatedResponse<Utilisateur>> {
    return this.http.get<PaginatedResponse<Utilisateur>>(this.baseUrl);
  }

  create(payload: UtilisateurCreatePayload): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(this.baseUrl, payload);
  }

  update(id: number, payload: UtilisateurUpdatePayload): Observable<Utilisateur> {
    return this.http.patch<Utilisateur>(`${this.baseUrl}${id}/`, payload);
  }

  /** Raccourci pratique : active/désactive un utilisateur sans passer par un formulaire */
  toggleActif(id: number, actif: boolean): Observable<Utilisateur> {
    return this.update(id, { is_active: actif });
  }
}
