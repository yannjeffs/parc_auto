import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Affectation } from '../../models/affectation.model';
import { PaginatedResponse } from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AffectationService {
  private readonly baseUrl = `${environment.apiUrl}/affectations/`;

  constructor(private http: HttpClient) {}

  list(filters?: {
    vehicule?: string;
    conducteur?: string;
    actif?: boolean;
    page?: number;
  }): Observable<PaginatedResponse<Affectation>> {
    let params = new HttpParams();
    if (filters?.vehicule) params = params.set('vehicule', filters.vehicule);
    if (filters?.conducteur) params = params.set('conducteur', filters.conducteur);
    if (filters?.actif !== undefined) params = params.set('actif', String(filters.actif));
    if (filters?.page) params = params.set('page', filters.page);

    return this.http.get<PaginatedResponse<Affectation>>(this.baseUrl, { params });
  }

  create(affectation: Partial<Affectation>): Observable<Affectation> {
    return this.http.post<Affectation>(this.baseUrl, affectation);
  }

  update(id: string, affectation: Partial<Affectation>): Observable<Affectation> {
    return this.http.patch<Affectation>(`${this.baseUrl}${id}/`, affectation);
  }

  /** Raccourci : termine une affectation en cours en fixant sa date de fin. */
  terminer(id: string, dateFin: string): Observable<Affectation> {
    return this.update(id, { date_fin: dateFin });
  }
}