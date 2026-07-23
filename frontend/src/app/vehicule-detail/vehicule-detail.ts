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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';

import { VehiculeService } from '../core/services/vehicule.service';
import { MaintenanceService } from '../core/services/maintenance.service';
import { CarburantService } from '../core/services/carburant.service';
import { DocumentService } from '../core/services/document.service';

import { Vehicule } from '../models/vehicule.model';
import { Maintenance } from '../models/maintenance.model';
import { PleinCarburant } from '../models/carburant.model';
import { DocumentVehicule } from '../models/document.model';

import { MaintenanceFormDialogComponent } from '../maintenance-form-dialog/maintenance-form-dialog';
import { CarburantFormDialogComponent } from '../carburant-form-dialog/carburant-form-dialog';
import { DocumentFormDialogComponent } from '../document-form-dialog/document-form-dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog';
import { RapportService } from '../core/services/rapport.service';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { MatTooltip } from '@angular/material/tooltip';

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
    MatDialogModule,
    MatTooltip
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

  maintenanceColumns = ['date_intervention', 'type_maintenance', 'description', 'cout', 'actions'];
  carburantColumns = ['date_plein', 'litres', 'cout_total', 'prix_par_litre', 'station', 'actions'];
  documentColumns = ['type_document', 'numero_document', 'date_expiration', 'est_valide', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehiculeService: VehiculeService,
    private maintenanceService: MaintenanceService,
    private carburantService: CarburantService,
    private documentService: DocumentService,
    private dialog: MatDialog,
    private rapportService: RapportService,
    public authService: AuthService,
    private notification: NotificationService,
  ) {}

  isExportingPdf = false;

  exporterPdf(): void {
    if (!this.vehicule) return;
    this.isExportingPdf = true;
    this.rapportService.exporterVehiculePdf(this.vehicule.id).subscribe({
      next: (blob) => {
        this.isExportingPdf = false;
        this.rapportService.declencherTelechargement(
          blob,
          `fiche_${this.vehicule!.immatriculation}.pdf`,
        );
        this.notification.succes('Fiche PDF téléchargée.');
      },
      error: (err) => {
        this.isExportingPdf = false;
        this.notification.erreur(
          this.notification.messageErreurApi(err, "Échec de l'export PDF."),
        );
      },
    });
  }

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
      error: (err) => {
        this.notFound = true;
        this.isLoading = false;
        this.notification.erreur(
          this.notification.messageErreurApi(err, 'Impossible de charger ce véhicule.'),
        );
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

  private rafraichirHistorique(): void {
    if (this.vehicule) {
      this.loadVehiculeEtHistorique(this.vehicule.id);
    }
  }

  // --- Maintenance ---

  openCreateMaintenance(): void {
    const dialogRef = this.dialog.open(MaintenanceFormDialogComponent, {
      data: { vehiculeId: this.vehicule!.id },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.succes('Intervention ajoutée.');
        this.rafraichirHistorique();
      }
    });
  }

  openEditMaintenance(maintenance: Maintenance): void {
    const dialogRef = this.dialog.open(MaintenanceFormDialogComponent, {
      data: { vehiculeId: this.vehicule!.id, maintenance },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.succes('Intervention modifiée.');
        this.rafraichirHistorique();
      }
    });
  }

  confirmDeleteMaintenance(maintenance: Maintenance): void {
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
            this.rafraichirHistorique();
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

  // --- Carburant ---

  openCreateCarburant(): void {
    const dialogRef = this.dialog.open(CarburantFormDialogComponent, {
      data: { vehiculeId: this.vehicule!.id },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.succes('Plein ajouté.');
        this.rafraichirHistorique();
      }
    });
  }

  openEditCarburant(plein: PleinCarburant): void {
    const dialogRef = this.dialog.open(CarburantFormDialogComponent, {
      data: { vehiculeId: this.vehicule!.id, plein },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.succes('Plein modifié.');
        this.rafraichirHistorique();
      }
    });
  }

  confirmDeleteCarburant(plein: PleinCarburant): void {
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
            this.rafraichirHistorique();
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

  // --- Documents ---

  openCreateDocument(): void {
    const dialogRef = this.dialog.open(DocumentFormDialogComponent, {
      data: { vehiculeId: this.vehicule!.id },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.succes('Document ajouté.');
        this.rafraichirHistorique();
      }
    });
  }

  openEditDocument(document: DocumentVehicule): void {
    const dialogRef = this.dialog.open(DocumentFormDialogComponent, {
      data: { vehiculeId: this.vehicule!.id, document },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notification.succes('Document modifié.');
        this.rafraichirHistorique();
      }
    });
  }

  confirmDeleteDocument(document: DocumentVehicule): void {
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
            this.rafraichirHistorique();
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
}