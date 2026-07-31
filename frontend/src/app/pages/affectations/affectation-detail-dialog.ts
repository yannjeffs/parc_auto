import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

import { CarburantService } from '../../core/services/carburant.service';
import { MaintenanceService } from '../../core/services/maintenance.service';
import { Affectation } from '../../models/affectation.model';
import { PleinCarburant } from '../../models/carburant.model';
import { Maintenance } from '../../models/maintenance.model';

export interface AffectationDetailData {
  affectation: Affectation;
}

@Component({
  selector: 'app-affectation-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './affectation-detail-dialog.html',
  styleUrl: './affectation-detail-dialog.scss',
})
export class AffectationDetailDialogComponent implements OnInit {
  private carburantService = inject(CarburantService);
  private maintenanceService = inject(MaintenanceService);
  private dialogRef = inject(MatDialogRef<AffectationDetailDialogComponent>);
  data: AffectationDetailData = inject(MAT_DIALOG_DATA);

  isLoading = true;
  pleins: PleinCarburant[] = [];
  maintenances: Maintenance[] = [];

  carburantColumns = ['date_plein', 'litres', 'cout_total', 'station'];
  maintenanceColumns = ['date_intervention', 'type_maintenance', 'description', 'cout'];

  ngOnInit(): void {
    const a = this.data.affectation;
    const debut = new Date(a.date_debut).getTime();
    const fin = a.date_fin ? new Date(a.date_fin).getTime() : Date.now();

    forkJoin({
      pleins: this.carburantService.list({ vehicule: a.vehicule, conducteur: a.conducteur, page_size: 200 }),
      maintenances: this.maintenanceService.list({ vehicule: a.vehicule, page_size: 200 }),
    }).subscribe({
      next: ({ pleins, maintenances }) => {
        // Filtrage côté client sur la période exacte de l'affectation — les
        // endpoints ne filtrent que par véhicule/conducteur, pas par plage de dates.
        this.pleins = pleins.results.filter((p) => {
          const t = new Date(p.date_plein).getTime();
          return t >= debut && t <= fin;
        });
        this.maintenances = maintenances.results.filter((m) => {
          const t = new Date(m.date_intervention).getTime();
          return t >= debut && t <= fin;
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  get coutTotalCarburant(): number {
    return this.pleins.reduce((sum, p) => sum + Number(p.cout_total), 0);
  }

  get coutTotalMaintenance(): number {
    return this.maintenances.reduce((sum, m) => sum + Number(m.cout), 0);
  }

  fermer(): void {
    this.dialogRef.close();
  }
}
