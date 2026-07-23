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

import { DocumentService } from '../core/services/document.service';
import { VehiculeService } from '../core/services/vehicule.service';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { DocumentVehicule } from '../models/document.model';
import { VehiculeListItem } from '../models/vehicule.model';
import { DocumentFormDialogComponent } from '../document-form-dialog/document-form-dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog';
import { MatTooltip } from "@angular/material/tooltip";

@Component({
  selector: 'app-document-list',
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
    MatTooltip
],
  templateUrl: './document-list.html',
  styleUrl: './document-list.scss',
})
export class DocumentListComponent implements OnInit {
  private documentService = inject(DocumentService);
  private vehiculeService = inject(VehiculeService);
  authService = inject(AuthService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  displayedColumns = ['vehicule', 'type_document', 'numero_document', 'date_expiration', 'est_valide', 'actions'];
  documents: DocumentVehicule[] = [];
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
    this.fetchDocuments();
  }

  onVehiculeFiltreChange(): void {
    this.pageIndex = 0;
    this.fetchDocuments();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchDocuments();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(DocumentFormDialogComponent, { data: {} });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.succes('Document ajouté.');
        this.fetchDocuments();
      }
    });
  }

  openEditDialog(document: DocumentVehicule): void {
    const dialogRef = this.dialog.open(DocumentFormDialogComponent, { data: { document } });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.succes('Document modifié.');
        this.fetchDocuments();
      }
    });
  }

  confirmDelete(document: DocumentVehicule): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer ce document ?',
        message: `${document.type_document} n° ${document.numero_document || '—'}.`,
        confirmLabel: 'Supprimer',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.documentService.delete(document.id).subscribe({
          next: () => {
            this.notification.succes('Document supprimé.');
            this.fetchDocuments();
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

  private fetchDocuments(): void {
    this.isLoading = true;
    this.documentService
      .list({ vehicule: this.vehiculeFiltre || undefined, page: this.pageIndex + 1 })
      .subscribe({
        next: (response) => {
          this.documents = response.results;
          this.totalCount = response.count;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.notification.erreur(
            this.notification.messageErreurApi(err, 'Impossible de charger les documents.'),
          );
        },
      });
  }
}