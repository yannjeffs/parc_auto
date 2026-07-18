import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vehicule, VehiculeListItem } from '../../models/vehicule.model';
import { PaginatedResponse } from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class VehiculeService {
  private readonly baseUrl = `${environment.apiUrl}/vehicules/`;

  constructor(private http: HttpClient) {}

  list(filters?: {
    statut?: string;
    type_vehicule?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Observable<PaginatedResponse<VehiculeListItem>> {
    let params = new HttpParams();
    if (filters?.statut) params = params.set('statut', filters.statut);
    if (filters?.type_vehicule) params = params.set('type_vehicule', filters.type_vehicule);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.page) params = params.set('page', filters.page);
    if (filters?.page_size) params = params.set('page_size', filters.page_size);

    return this.http.get<PaginatedResponse<VehiculeListItem>>(this.baseUrl, { params });
  }

  get(id: string): Observable<Vehicule> {
    return this.http.get<Vehicule>(`${this.baseUrl}${id}/`);
  }

  create(vehicule: Partial<Vehicule>): Observable<Vehicule> {
    return this.http.post<Vehicule>(this.baseUrl, vehicule);
  }

  update(id: string, vehicule: Partial<Vehicule>): Observable<Vehicule> {
    return this.http.patch<Vehicule>(`${this.baseUrl}${id}/`, vehicule);
  }

  delete(id: string): Observable<void> {
    // Soft delete côté backend (perform_destroy désactive is_active plutôt que supprimer)
    return this.http.delete<void>(`${this.baseUrl}${id}/`);
  }

  uploadPhoto(id: string, file: File): Observable<Vehicule> {
    const formData = new FormData();
    formData.append('photo', file);
    // PATCH multipart : seul le champ photo est envoyé, le reste du véhicule n'est pas touché
    return this.http.patch<Vehicule>(`${this.baseUrl}${id}/`, formData);
  }
}