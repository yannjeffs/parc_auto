import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { UtilisateurService } from '../core/services/utilisateur.service';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { Utilisateur } from '../models/utilisateur.model';
import { UtilisateurFormDialogComponent } from '../utilisateur-form-dialog/utilisateur-form-dialog';
import { MatTooltip } from "@angular/material/tooltip";

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  gestionnaire: 'Gestionnaire',
  lecture_seule: 'Lecture seule',
};

@Component({
  selector: 'app-utilisateur-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltip
],
  templateUrl: './utilisateur-list.html',
  styleUrl: './utilisateur-list.scss',
})
export class UtilisateurListComponent implements OnInit {
  private utilisateurService = inject(UtilisateurService);
  authService = inject(AuthService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  displayedColumns = ['username', 'email', 'role', 'statut', 'actions'];
  utilisateurs: Utilisateur[] = [];
  isLoading = false;
  roleLabels = ROLE_LABELS;

  ngOnInit(): void {
    this.fetchUtilisateurs();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UtilisateurFormDialogComponent, { data: {} });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.succes('Compte créé avec succès.');
        this.fetchUtilisateurs();
      }
    });
  }

  openEditDialog(utilisateur: Utilisateur): void {
    const dialogRef = this.dialog.open(UtilisateurFormDialogComponent, { data: { utilisateur } });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.succes('Compte modifié avec succès.');
        this.fetchUtilisateurs();
      }
    });
  }

  toggleActif(utilisateur: Utilisateur): void {
    this.utilisateurService.toggleActif(utilisateur.id, !utilisateur.is_active).subscribe({
      next: () => {
        this.notification.succes(
          utilisateur.is_active ? 'Compte désactivé.' : 'Compte réactivé.',
        );
        this.fetchUtilisateurs();
      },
      error: (err) => {
        this.notification.erreur(
          this.notification.messageErreurApi(err, 'Échec de la mise à jour.'),
        );
      },
    });
  }

  private fetchUtilisateurs(): void {
    this.isLoading = true;
    this.utilisateurService.list().subscribe({
      next: (response) => {
        this.utilisateurs = response.results;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.notification.erreur(
          this.notification.messageErreurApi(err, 'Impossible de charger les comptes.'),
        );
      },
    });
  }
}
