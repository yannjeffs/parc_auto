import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StatsPeriode {
  semaine: number;
  mois: number;
}

export interface StatsCarburantAffectation {
  jour: number;
  semaine: number;
  mois: number;
}

export interface TendanceMensuelle {
  mois: string;
  cout_maintenance: number;
  cout_carburant: number;
}

export interface DashboardStats {
  maintenances: {
    preventive: StatsPeriode;
    curative: StatsPeriode;
  };
  carburant: StatsCarburantAffectation;
  affectations: StatsCarburantAffectation;
  tendances: TendanceMensuelle[];
}

@Injectable({ providedIn: 'root' })
export class DashboardStatsService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${environment.apiUrl}/rapports/dashboard-stats/`);
  }
}
