import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { forkJoin } from 'rxjs';

import { VehiculeService } from '../core/services/vehicule.service';
import { ConducteurService } from '../core/services/conducteur.service';
import { DocumentService } from '../core/services/document.service';
import { MaintenanceService } from '../core/services/maintenance.service';
import { CarburantService } from '../core/services/carburant.service';
import { DocumentVehicule } from '../models/document.model';

interface KpiCard {
  label: string;
  value: number | string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  kpis: KpiCard[] = [];
  documentsAlerte: (DocumentVehicule & { immatriculation?: string })[] = [];
  coutMaintenanceMois = 0;
  coutCarburantMois = 0;

  constructor(
    private vehiculeService: VehiculeService,
    @Inject(ConducteurService) private conducteurService: ConducteurService,
    private documentService: DocumentService,
    private maintenanceService: MaintenanceService,
    private carburantService: CarburantService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      totalVehicules: this.vehiculeService.list({ page: 1 }),
      enPanne: this.vehiculeService.list({ statut: 'en_panne', page: 1 }),
      enMaintenance: this.vehiculeService.list({ statut: 'en_maintenance', page: 1 }),
      conducteursDisponibles: this.conducteurService.list({ statut: 'disponible', page: 1 }),
      documents: this.documentService.list({ page: 1 }),
      maintenances: this.maintenanceService.list({ page: 1 }),
      pleins: this.carburantService.list({ page: 1 }),
    }).subscribe({
      next: ({ totalVehicules, enPanne, enMaintenance, conducteursDisponibles, documents, maintenances, pleins }) => {
        this.kpis = [
          {
            label: 'Véhicules au total',
            value: totalVehicules.count,
            icon: 'directions_car',
            colorClass: 'kpi-blue',
          },
          {
            label: 'En panne',
            value: enPanne.count,
            icon: 'report_problem',
            colorClass: 'kpi-red',
          },
          {
            label: 'En maintenance',
            value: enMaintenance.count,
            icon: 'build',
            colorClass: 'kpi-orange',
          },
          {
            label: 'Conducteurs disponibles',
            value: conducteursDisponibles.count,
            icon: 'badge',
            colorClass: 'kpi-green',
          },
        ];

        // Documents expirés ou expirant dans les 30 prochains jours
        const dansTrenteJours = new Date();
        dansTrenteJours.setDate(dansTrenteJours.getDate() + 30);

        this.documentsAlerte = documents.results
          .filter((d) => d.date_expiration && new Date(d.date_expiration) <= dansTrenteJours)
          .sort(
            (a, b) =>
              new Date(a.date_expiration!).getTime() - new Date(b.date_expiration!).getTime(),
          )
          .slice(0, 8);

        // Coûts du mois en cours
        const maintenant = new Date();
        const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);

        this.coutMaintenanceMois = maintenances.results
          .filter((m) => new Date(m.date_intervention) >= debutMois)
          .reduce((sum, m) => sum + Number(m.cout), 0);

        this.coutCarburantMois = pleins.results
          .filter((p) => new Date(p.date_plein) >= debutMois)
          .reduce((sum, p) => sum + Number(p.cout_total), 0);

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  estExpire(document: DocumentVehicule): boolean {
    return !document.date_expiration || new Date(document.date_expiration) < new Date();
  }
}