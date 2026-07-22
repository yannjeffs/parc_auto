import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MaintenanceService } from '../core/services/maintenance.service';
import { VehiculeService } from '../core/services/vehicule.service';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { Maintenance } from '../models/maintenance.model';
import { VehiculeListItem } from '../models/vehicule.model';
import { MaintenanceFormDialogComponent } from '../maintenance-form-dialog/maintenance-form-dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-maintenance-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './maintenance-list.html',
  styleUrl: './maintenance-list.scss',
})
export class MaintenanceListComponent implements OnInit {
  private maintenanceService = inject(MaintenanceService);
  private vehiculeService = inject(VehiculeService);
  authService = inject(AuthService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  displayedColumns = ['vehicule', 'date_intervention', 'type_maintenance', 'description', 'cout', 'actions'];
  maintenances: Maintenance[] = [];
  vehicules: VehiculeListItem[] = [];
  totalCount = 0;
  pageSize = 20;
  pageIndex = 0;
  isLoading = false;
  vehiculeFiltre: string | null = null;

  ngOnInit(): void {
    this.vehiculeService.list({ page_size: 200 }).subscribe({
      next: (response) => (this.vehicules = response.results),
      error: () => undefined,
    });
    this.fetchMaintenances();
  }

  onVehiculeFiltreChange(): void {
    this.pageIndex = 0;
    this.fetchMaintenances();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchMaintenances();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(MaintenanceFormDialogComponent, { data: {} });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.succes('Intervention ajoutée.');
        this.fetchMaintenances();
      }
    });
  }

  openEditDialog(maintenance: Maintenance): void {
    const dialogRef = this.dialog.open(MaintenanceFormDialogComponent, { data: { maintenance } });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.succes('Intervention modifiée.');
        this.fetchMaintenances();
      }
    });
  }

  confirmDelete(maintenance: Maintenance): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer cette intervention ?',
        message: `Intervention du ${maintenance.date_intervention} (${maintenance.description}).`,
        confirmLabel: 'Supprimer',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.maintenanceService.delete(maintenance.id).subscribe({
          next: () => {
            this.notification.succes('Intervention supprimée.');
            this.fetchMaintenances();
          },
          error: (err) => {
            this.notification.erreur(
              this.notification.messageErreurApi(err, 'Échec de la suppression.'),
            );
          },
        });
      }
    });
  }

  private fetchMaintenances(): void {
    this.isLoading = true;
    this.maintenanceService
      .list({ vehicule: this.vehiculeFiltre || undefined, page: this.pageIndex + 1 })
      .subscribe({
        next: (response) => {
          this.maintenances = response.results;
          this.totalCount = response.count;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.notification.erreur(
            this.notification.messageErreurApi(err, "Impossible de charger l'historique."),
          );
        },
      });
  }
}