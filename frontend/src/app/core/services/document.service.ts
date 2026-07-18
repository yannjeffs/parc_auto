import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentVehicule } from '../../models/document.model';
import { PaginatedResponse } from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly baseUrl = `${environment.apiUrl}/documents/`;

  constructor(private http: HttpClient) {}

  list(filters?: { vehicule?: string; type_document?: string; page?: number }):
    Observable<PaginatedResponse<DocumentVehicule>> {
    let params = new HttpParams();
    if (filters?.vehicule) params = params.set('vehicule', filters.vehicule);
    if (filters?.type_document) params = params.set('type_document', filters.type_document);
    if (filters?.page) params = params.set('page', filters.page);

    return this.http.get<PaginatedResponse<DocumentVehicule>>(this.baseUrl, { params });
  }

  get(id: string): Observable<DocumentVehicule> {
    return this.http.get<DocumentVehicule>(`${this.baseUrl}${id}/`);
  }

  create(document: Partial<DocumentVehicule>): Observable<DocumentVehicule> {
    return this.http.post<DocumentVehicule>(this.baseUrl, document);
  }

  update(id: string, document: Partial<DocumentVehicule>): Observable<DocumentVehicule> {
    return this.http.patch<DocumentVehicule>(`${this.baseUrl}${id}/`, document);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}/`);
  }
}