import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PleinCarburant } from '../../models/carburant.model';
import { PaginatedResponse } from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class CarburantService {
  private readonly baseUrl = `${environment.apiUrl}/pleins-carburant/`;

  constructor(private http: HttpClient) {}

  list(filters?: { vehicule?: string; conducteur?: string; page?: number }):
    Observable<PaginatedResponse<PleinCarburant>> {
    let params = new HttpParams();
    if (filters?.vehicule) params = params.set('vehicule', filters.vehicule);
    if (filters?.conducteur) params = params.set('conducteur', filters.conducteur);
    if (filters?.page) params = params.set('page', filters.page);

    return this.http.get<PaginatedResponse<PleinCarburant>>(this.baseUrl, { params });
  }

  get(id: string): Observable<PleinCarburant> {
    return this.http.get<PleinCarburant>(`${this.baseUrl}${id}/`);
  }

  create(plein: Partial<PleinCarburant>): Observable<PleinCarburant> {
    return this.http.post<PleinCarburant>(this.baseUrl, plein);
  }

  update(id: string, plein: Partial<PleinCarburant>): Observable<PleinCarburant> {
    return this.http.patch<PleinCarburant>(`${this.baseUrl}${id}/`, plein);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}/`);
  }
}