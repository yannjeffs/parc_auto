import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

import { VehiculeService } from '../core/services/vehicule.service';
import { MaintenanceService } from '../core/services/maintenance.service';
import { CarburantService } from '../core/services/carburant.service';
import { DocumentService } from '../core/services/document.service';

import { Vehicule } from '../models/vehicule.model';
import { Maintenance } from '../models/maintenance.model';
import { PleinCarburant } from '../models/carburant.model';
import { DocumentVehicule } from '../models/document.model';

@Component({
  selector: 'app-vehicule-detail',
  standalone: true,
  imports: [
    CommonModule,
    // RouterLink,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './vehicule-detail.html',
  styleUrl: './vehicule-detail.scss',
})
export class VehiculeDetailComponent implements OnInit {
  vehicule: Vehicule | null = null;
  maintenances: Maintenance[] = [];
  pleinsCarburant: PleinCarburant[] = [];
  documents: DocumentVehicule[] = [];
  isLoading = true;
  notFound = false;

  maintenanceColumns = ['date_intervention', 'type_maintenance', 'description', 'cout'];
  carburantColumns = ['date_plein', 'litres', 'cout_total', 'prix_par_litre', 'station'];
  documentColumns = ['type_document', 'numero_document', 'date_expiration', 'est_valide'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehiculeService: VehiculeService,
    private maintenanceService: MaintenanceService,
    private carburantService: CarburantService,
    private documentService: DocumentService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound = true;
      this.isLoading = false;
      return;
    }
    this.loadVehiculeEtHistorique(id);
  }

  private loadVehiculeEtHistorique(id: string): void {
    this.isLoading = true;

    forkJoin({
      vehicule: this.vehiculeService.get(id),
      maintenances: this.maintenanceService.list({ vehicule: id }),
      pleins: this.carburantService.list({ vehicule: id }),
      documents: this.documentService.list({ vehicule: id }),
    }).subscribe({
      next: ({ vehicule, maintenances, pleins, documents }) => {
        this.vehicule = vehicule;
        this.maintenances = maintenances.results;
        this.pleinsCarburant = pleins.results;
        this.documents = documents.results;
        this.isLoading = false;
      },
      error: () => {
        this.notFound = true;
        this.isLoading = false;
      },
    });
  }

  get coutTotalMaintenance(): number {
    return this.maintenances.reduce((sum, m) => sum + Number(m.cout), 0);
  }

  get coutTotalCarburant(): number {
    return this.pleinsCarburant.reduce((sum, p) => sum + Number(p.cout_total), 0);
  }

  retourListe(): void {
    this.router.navigate(['/vehicules']);
  }
}