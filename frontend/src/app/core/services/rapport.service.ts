import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RapportService {
  private readonly baseUrl = `${environment.apiUrl}/rapports`;

  constructor(private http: HttpClient) {}

  exporterVehiculePdf(vehiculeId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/vehicules/${vehiculeId}/export-pdf/`, {
      responseType: 'blob',
    });
  }

  exporterFlotteExcel(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/flotte/export-excel/`, {
      responseType: 'blob',
    });
  }

  /** Déclenche le téléchargement navigateur d'un blob reçu de l'API. */
  declencherTelechargement(blob: Blob, nomFichier: string): void {
    const url = window.URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = nomFichier;
    lien.click();
    window.URL.revokeObjectURL(url);
  }
}
