import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { ConducteurService } from '../core/services/conducteur.service';
import { Conducteur } from '../models/conducteur.model';
import { ConducteurFormDialogComponent } from './conducteur-form-dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';

const STATUT_LABELS: Record<string, string> = {
  disponible: 'Disponible',
  en_mission: 'En mission',
  en_conge: 'En congé',
  suspendu: 'Suspendu',
};

const STATUT_COLORS: Record<string, string> = {
  disponible: 'statut-ok',
  en_mission: 'statut-warn',
  en_conge: 'statut-neutral',
  suspendu: 'statut-danger',
};

@Component({
  selector: 'app-conducteur-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './conducteur-list.html',
  styleUrl: './conducteur-list.scss',
})
export class ConducteurListComponent implements OnInit {
  displayedColumns = ['nom', 'telephone', 'permis', 'statut', 'actions'];
  conducteurs: Conducteur[] = [];
  totalCount = 0;
  pageSize = 20;
  pageIndex = 0;
  isLoading = false;
  currentSearch = '';

  statutLabels = STATUT_LABELS;
  statutColors = STATUT_COLORS;

  private searchSubject = new Subject<string>();

  constructor(
    private conducteurService: ConducteurService,
    private dialog: MatDialog,
    public authService: AuthService,
    private notification: NotificationService,
  ) {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.currentSearch = term;
      this.pageIndex = 0;
      this.fetchConducteurs();
    });
  }

  ngOnInit(): void {
    this.fetchConducteurs();
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchConducteurs();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ConducteurFormDialogComponent, { data: {} });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.succes('Conducteur créé avec succès.');
        this.fetchConducteurs();
      }
    });
  }

  openEditDialog(conducteur: Conducteur, event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ConducteurFormDialogComponent, { data: { conducteur } });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.succes('Conducteur modifié avec succès.');
        this.fetchConducteurs();
      }
    });
  }

  confirmDelete(conducteur: Conducteur, event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer ce conducteur ?',
        message: `${conducteur.prenom} ${conducteur.nom} sera désactivé (l'historique est conservé).`,
        confirmLabel: 'Supprimer',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.conducteurService.delete(conducteur.id).subscribe({
          next: () => {
            this.notification.succes('Conducteur supprimé.');
            this.fetchConducteurs();
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

  private fetchConducteurs(): void {
    this.isLoading = true;
    this.conducteurService
      .list({ search: this.currentSearch, page: this.pageIndex + 1 })
      .subscribe({
        next: (response) => {
          this.conducteurs = response.results;
          this.totalCount = response.count;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.notification.erreur(
            this.notification.messageErreurApi(err, 'Impossible de charger la liste des conducteurs.'),
          );
        },
      });
  }
}