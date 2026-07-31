import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Maintenance } from '../../models/maintenance.model';
import { PaginatedResponse } from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private readonly baseUrl = `${environment.apiUrl}/maintenances/`;

  constructor(private http: HttpClient) {}

  list(filters?: { vehicule?: string; type_maintenance?: string; statut?: string; page?: number; page_size?: number }):
    Observable<PaginatedResponse<Maintenance>> {
    let params = new HttpParams();
    if (filters?.vehicule) params = params.set('vehicule', filters.vehicule);
    if (filters?.type_maintenance) params = params.set('type_maintenance', filters.type_maintenance);
    if (filters?.statut) params = params.set('statut', filters.statut);
    if (filters?.page) params = params.set('page', filters.page);
    if (filters?.page_size) params = params.set('page_size', filters.page_size);

    return this.http.get<PaginatedResponse<Maintenance>>(this.baseUrl, { params });
  }

  get(id: string): Observable<Maintenance> {
    return this.http.get<Maintenance>(`${this.baseUrl}${id}/`);
  }

  create(maintenance: Partial<Maintenance>): Observable<Maintenance> {
    return this.http.post<Maintenance>(this.baseUrl, maintenance);
  }

  update(id: string, maintenance: Partial<Maintenance>): Observable<Maintenance> {
    return this.http.patch<Maintenance>(`${this.baseUrl}${id}/`, maintenance);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}/`);
  }
}
