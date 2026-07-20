import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AffectationService } from '../../core/services/affectation.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Affectation } from '../../models/affectation.model';
import { AffectationFormDialogComponent } from './affectation-form-dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-affectation-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './affectation-list.html',
  styleUrl: './affectation-list.scss',
})
export class AffectationListComponent implements OnInit {
  private affectationService = inject(AffectationService);
  authService = inject(AuthService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  displayedColumns = ['vehicule', 'conducteur', 'date_debut', 'date_fin', 'motif', 'actions'];
  affectations: Affectation[] = [];
  totalCount = 0;
  pageSize = 20;
  pageIndex = 0;
  isLoading = false;
  actifsUniquement = false;

  ngOnInit(): void {
    this.fetchAffectations();
  }

  onToggleActifs(): void {
    this.actifsUniquement = !this.actifsUniquement;
    this.pageIndex = 0;
    this.fetchAffectations();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchAffectations();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(AffectationFormDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.succes('Affectation créée.');
        this.fetchAffectations();
      }
    });
  }

  confirmTerminer(affectation: Affectation): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: "Terminer cette affectation ?",
        message: `${affectation.conducteur_nom} ne sera plus rattaché à ${affectation.vehicule_immatriculation} à partir d'aujourd'hui.`,
        confirmLabel: 'Terminer',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        const aujourdhui = new Date().toISOString().split('T')[0];
        this.affectationService.terminer(affectation.id, aujourdhui).subscribe({
          next: () => {
            this.notification.succes('Affectation terminée.');
            this.fetchAffectations();
          },
          error: (err) => {
            this.notification.erreur(
              this.notification.messageErreurApi(err, 'Échec de la mise à jour.'),
            );
          },
        });
      }
    });
  }

  private fetchAffectations(): void {
    this.isLoading = true;
    this.affectationService
      .list({
        actif: this.actifsUniquement ? true : undefined,
        page: this.pageIndex + 1,
      })
      .subscribe({
        next: (response) => {
          this.affectations = response.results;
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