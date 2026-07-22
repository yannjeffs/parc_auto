import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { provideNativeDateAdapter } from '@angular/material/core';

import { MaintenanceService } from '../core/services/maintenance.service';
import { VehiculeService } from '../core/services/vehicule.service';
import { Maintenance, TypeMaintenance, StatutMaintenance } from '../models/maintenance.model';
import { VehiculeListItem } from '../models/vehicule.model';

export interface MaintenanceFormData {
  /** Fourni depuis la fiche véhicule : le champ véhicule est alors verrouillé.
   *  Omis depuis la page globale Maintenance : un sélecteur véhicule apparaît. */
  vehiculeId?: string;
  maintenance?: Maintenance;
}

const TYPE_OPTIONS: { value: TypeMaintenance; label: string }[] = [
  { value: 'preventive', label: 'Préventive (planifiée)' },
  { value: 'curative', label: 'Curative (panne)' },
];

const STATUT_OPTIONS: { value: StatutMaintenance; label: string }[] = [
  { value: 'planifiee', label: 'Planifiée' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'terminee', label: 'Terminée' },
  { value: 'annulee', label: 'Annulée' },
];

@Component({
  selector: 'app-maintenance-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './maintenance-form-dialog.html',
  styleUrl: './maintenance-form-dialog.scss',
})
export class MaintenanceFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private maintenanceService = inject(MaintenanceService);
  private vehiculeService = inject(VehiculeService);
  private dialogRef = inject(MatDialogRef<MaintenanceFormDialogComponent>);
  data: MaintenanceFormData = inject(MAT_DIALOG_DATA);

  isEdition = !!this.data?.maintenance;
  /** true si on doit afficher le sélecteur véhicule (page globale, pas de vehiculeId imposé) */
  vehiculeLibre = !this.data?.vehiculeId && !this.data?.maintenance;
  isSaving = false;
  errorMessage: string | null = null;
  vehicules: VehiculeListItem[] = [];

  typeOptions = TYPE_OPTIONS;
  statutOptions = STATUT_OPTIONS;

  form = this.fb.group({
    vehicule: [this.data?.vehiculeId || '', Validators.required],
    type_maintenance: ['preventive' as TypeMaintenance, Validators.required],
    statut: ['terminee' as StatutMaintenance, Validators.required],
    description: ['', Validators.required],
    date_intervention: [new Date(), Validators.required],
    kilometrage_intervention: [0, [Validators.required, Validators.min(0)]],
    cout: [0, [Validators.required, Validators.min(0)]],
    prestataire: [''],
    prochaine_echeance_date: [null as Date | null],
    prochaine_echeance_km: [null as number | null],
  });

  constructor() {
    if (this.data?.maintenance) {
      const m = this.data.maintenance;
      this.form.patchValue({
        vehicule: m.vehicule,
        type_maintenance: m.type_maintenance,
        statut: m.statut,
        description: m.description,
        date_intervention: new Date(m.date_intervention),
        kilometrage_intervention: m.kilometrage_intervention,
        cout: Number(m.cout),
        prestataire: m.prestataire,
        prochaine_echeance_date: m.prochaine_echeance_date ? new Date(m.prochaine_echeance_date) : null,
        prochaine_echeance_km: m.prochaine_echeance_km,
      });
    }
  }

  ngOnInit(): void {
    if (this.vehiculeLibre) {
      this.vehiculeService.list({ page_size: 200 }).subscribe({
        next: (response) => (this.vehicules = response.results),
        error: () => undefined,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;

    const raw = this.form.value;
    const payload: Partial<Maintenance> = {
      ...raw,
      date_intervention: (raw.date_intervention as Date).toISOString().split('T')[0],
      cout: String(raw.cout),
      prochaine_echeance_date: raw.prochaine_echeance_date
        ? (raw.prochaine_echeance_date as Date).toISOString().split('T')[0]
        : null,
    } as unknown as Partial<Maintenance>;

    const request$ = this.isEdition
      ? this.maintenanceService.update(this.data.maintenance!.id, payload)
      : this.maintenanceService.create(payload);

    request$.subscribe({
      next: (maintenance) => {
        this.isSaving = false;
        this.dialogRef.close(maintenance);
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'Une erreur est survenue lors de l\'enregistrement.';
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}