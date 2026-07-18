import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Conducteur } from '../../models/conducteur.model';
import { PaginatedResponse } from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class ConducteurService {
  private readonly baseUrl = `${environment.apiUrl}/conducteurs/`;

  constructor(private http: HttpClient) {}

  list(filters?: { statut?: string; search?: string; page?: number; page_size?: number }):
    Observable<PaginatedResponse<Conducteur>> {
    let params = new HttpParams();
    if (filters?.statut) params = params.set('statut', filters.statut);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.page) params = params.set('page', filters.page);
    if (filters?.page_size) params = params.set('page_size', filters.page_size);

    return this.http.get<PaginatedResponse<Conducteur>>(this.baseUrl, { params });
  }

  get(id: string): Observable<Conducteur> {
    return this.http.get<Conducteur>(`${this.baseUrl}${id}/`);
  }

  create(conducteur: Partial<Conducteur>): Observable<Conducteur> {
    return this.http.post<Conducteur>(this.baseUrl, conducteur);
  }

  update(id: string, conducteur: Partial<Conducteur>): Observable<Conducteur> {
    return this.http.patch<Conducteur>(`${this.baseUrl}${id}/`, conducteur);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}/`);
  }
}