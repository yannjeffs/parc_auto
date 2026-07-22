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

import { CarburantService } from '../core/services/carburant.service';
import { VehiculeService } from '../core/services/vehicule.service';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { PleinCarburant } from '../models/carburant.model';
import { VehiculeListItem } from '../models/vehicule.model';
import { CarburantFormDialogComponent } from '../carburant-form-dialog/carburant-form-dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-carburant-list',
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
  templateUrl: './carburant-list.html',
  styleUrl: './carburant-list.scss',
})
export class CarburantListComponent implements OnInit {
  private carburantService = inject(CarburantService);
  private vehiculeService = inject(VehiculeService);
  authService = inject(AuthService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  displayedColumns = ['vehicule', 'date_plein', 'litres', 'cout_total', 'station', 'actions'];
  pleins: PleinCarburant[] = [];
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
    this.fetchPleins();
  }

  onVehiculeFiltreChange(): void {
    this.pageIndex = 0;
    this.fetchPleins();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchPleins();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CarburantFormDialogComponent, { data: {} });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.succes('Plein ajouté.');
        this.fetchPleins();
      }
    });
  }

  openEditDialog(plein: PleinCarburant): void {
    const dialogRef = this.dialog.open(CarburantFormDialogComponent, { data: { plein } });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.succes('Plein modifié.');
        this.fetchPleins();
      }
    });
  }

  confirmDelete(plein: PleinCarburant): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer ce plein ?',
        message: `Plein du ${plein.date_plein} — ${plein.litres} L.`,
        confirmLabel: 'Supprimer',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.carburantService.delete(plein.id).subscribe({
          next: () => {
            this.notification.succes('Plein supprimé.');
            this.fetchPleins();
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

  private fetchPleins(): void {
    this.isLoading = true;
    this.carburantService
      .list({ vehicule: this.vehiculeFiltre || undefined, page: this.pageIndex + 1 })
      .subscribe({
        next: (response) => {
          this.pleins = response.results;
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