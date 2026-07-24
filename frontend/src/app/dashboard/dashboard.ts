import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { forkJoin } from 'rxjs';
import { ConducteurService } from '../core/services/conducteur.service';
import { DashboardStats, DashboardStatsService } from '../core/services/dashboardStats.service';
import { DocumentService } from '../core/services/document.service';
import { VehiculeService } from '../core/services/vehicule.service';
import { DocumentVehicule } from '../models/document.model';



interface KpiCard {
  label: string;
  value: number | string;
  icon: string;
  colorClass: string;
}

interface ActiviteCard {
  titre: string;
  icon: string;
  colonnes: { label: string; valeur: number }[];
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
    BaseChartDirective,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  private vehiculeService = inject(VehiculeService);
  private conducteurService = inject(ConducteurService);
  private documentService = inject(DocumentService);
  private statsService = inject(DashboardStatsService);

  isLoading = true;
  kpis: KpiCard[] = [];
  activiteCards: ActiviteCard[] = [];
  documentsAlerte: DocumentVehicule[] = [];

  // --- Configuration du graphique en courbes (Chart.js via ng2-charts) ---
  lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${Number(value).toLocaleString('fr-FR')} F`,
        },
      },
    },
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  ngOnInit(): void {
    forkJoin({
      totalVehicules: this.vehiculeService.list({ page_size: 1 }),
      enPanne: this.vehiculeService.list({ statut: 'en_panne', page_size: 1 }),
      enMaintenance: this.vehiculeService.list({ statut: 'en_maintenance', page_size: 1 }),
      conducteursDisponibles: this.conducteurService.list({ statut: 'disponible', page_size: 1 }),
      documents: this.documentService.list({ page_size: 200 }),
      stats: this.statsService.getStats(),
    }).subscribe({
      next: ({ totalVehicules, enPanne, enMaintenance, conducteursDisponibles, documents, stats }) => {
        this.kpis = [
          { label: 'Véhicules au total', value: totalVehicules.count, icon: 'directions_car', colorClass: 'kpi-blue' },
          { label: 'En panne', value: enPanne.count, icon: 'report_problem', colorClass: 'kpi-red' },
          { label: 'En maintenance', value: enMaintenance.count, icon: 'build', colorClass: 'kpi-orange' },
          { label: 'Conducteurs disponibles', value: conducteursDisponibles.count, icon: 'badge', colorClass: 'kpi-green' },
        ];

        this.construireActiviteCards(stats);
        this.construireGraphique(stats);

        const dansTrenteJours = new Date();
        dansTrenteJours.setDate(dansTrenteJours.getDate() + 30);
        this.documentsAlerte = documents.results
          .filter((d) => d.date_expiration && new Date(d.date_expiration) <= dansTrenteJours)
          .sort((a, b) => new Date(a.date_expiration!).getTime() - new Date(b.date_expiration!).getTime())
          .slice(0, 8);

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private construireActiviteCards(stats: DashboardStats): void {
    this.activiteCards = [
      {
        titre: 'Entretiens (préventif)',
        icon: 'build_circle',
        colonnes: [
          { label: 'Semaine', valeur: stats.maintenances.preventive.semaine },
          { label: 'Mois', valeur: stats.maintenances.preventive.mois },
        ],
      },
      {
        titre: 'Maintenances (curatif)',
        icon: 'report_problem',
        colonnes: [
          { label: 'Semaine', valeur: stats.maintenances.curative.semaine },
          { label: 'Mois', valeur: stats.maintenances.curative.mois },
        ],
      },
      {
        titre: 'Pleins de carburant',
        icon: 'local_gas_station',
        colonnes: [
          { label: 'Jour', valeur: stats.carburant.jour },
          { label: 'Semaine', valeur: stats.carburant.semaine },
          { label: 'Mois', valeur: stats.carburant.mois },
        ],
      },
      {
        titre: 'Affectations véhicules',
        icon: 'assignment_ind',
        colonnes: [
          { label: 'Jour', valeur: stats.affectations.jour },
          { label: 'Semaine', valeur: stats.affectations.semaine },
          { label: 'Mois', valeur: stats.affectations.mois },
        ],
      },
    ];
  }

  private construireGraphique(stats: DashboardStats): void {
    this.lineChartData = {
      labels: stats.tendances.map((t) => t.mois),
      datasets: [
        {
          label: 'Coût maintenance (FCFA)',
          data: stats.tendances.map((t) => t.cout_maintenance),
          borderColor: '#FB8C00',
          backgroundColor: 'rgba(251, 140, 0, 0.1)',
          tension: 0.3,
          fill: true,
        },
        {
          label: 'Coût carburant (FCFA)',
          data: stats.tendances.map((t) => t.cout_carburant),
          borderColor: '#00ACC1',
          backgroundColor: 'rgba(0, 172, 193, 0.1)',
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }
}
