import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { VehiculeService } from '../core/services/vehicule.service';
import { VehiculeListItem } from '../models/vehicule.model';
import { VehiculeFormDialogComponent } from '../vehicule-form-dialog/vehicule-form-dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog';

const STATUT_LABELS: Record<string, string> = {
  en_service: 'En service',
  en_maintenance: 'En maintenance',
  en_panne: 'En panne',
  hors_service: 'Hors service',
  vendu: 'Vendu',
};

const STATUT_COLORS: Record<string, string> = {
  en_service: 'statut-ok',
  en_maintenance: 'statut-warn',
  en_panne: 'statut-danger',
  hors_service: 'statut-neutral',
  vendu: 'statut-neutral',
};

@Component({
  selector: 'app-vehicule-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
  ],
  templateUrl: './vehicule-list.html',
  styleUrl: './vehicule-list.scss',
})
export class VehiculeListComponent implements OnInit {
  displayedColumns = ['immatriculation', 'marque_modele', 'statut', 'kilometrage_actuel', 'actions'];
  vehicules: VehiculeListItem[] = [];
  totalCount = 0;
  pageSize = 20;
  pageIndex = 0;
  isLoading = false;
  currentSearch = '';

  private searchSubject = new Subject<string>();
  statutLabels = STATUT_LABELS;
  statutColors = STATUT_COLORS;

  constructor(
    private vehiculeService: VehiculeService,
    private router: Router,
    private dialog: MatDialog,
  ) {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.currentSearch = term;
      this.pageIndex = 0;
      this.fetchVehicules(term);
    });
  }

  voirDetail(id: string): void {
    this.router.navigate(['/vehicules', id]);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(VehiculeFormDialogComponent, { data: {} });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchVehicules(this.currentSearch);
      }
    });
  }

  openEditDialog(id: string, event: Event): void {
    event.stopPropagation();
    this.vehiculeService.get(id).subscribe((vehicule) => {
      const dialogRef = this.dialog.open(VehiculeFormDialogComponent, { data: { vehicule } });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.fetchVehicules(this.currentSearch);
        }
      });
    });
  }

  confirmDelete(id: string, immatriculation: string, event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer ce véhicule ?',
        message: `Le véhicule ${immatriculation} sera désactivé (les données historiques sont conservées). Cette action peut être annulée par un administrateur.`,
        confirmLabel: 'Supprimer',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.vehiculeService.delete(id).subscribe(() => {
          this.fetchVehicules(this.currentSearch);
        });
      }
    });
  }

  ngOnInit(): void {
    this.fetchVehicules();
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchVehicules();
  }

  private fetchVehicules(search?: string): void {
    this.isLoading = true;
    this.vehiculeService.list({ search, page: this.pageIndex + 1 }).subscribe({
      next: (response) => {
        this.vehicules = response.results;
        this.totalCount = response.count;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}