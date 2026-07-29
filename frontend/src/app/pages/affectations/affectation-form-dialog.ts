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

import { AffectationService } from '../../core/services/affectation.service';
import { VehiculeService } from '../../core/services/vehicule.service';
import { ConducteurService } from '../../core/services/conducteur.service';
import { Affectation } from '../../models/affectation.model';
import { VehiculeListItem } from '../../models/vehicule.model';
import { Conducteur } from '../../models/conducteur.model';

export interface AffectationFormData {
  /** Fourni depuis la fiche véhicule : le champ véhicule est alors verrouillé. */
  vehiculeId?: string;
  vehiculeLabel?: string;
}

@Component({
  selector: 'app-affectation-form-dialog',
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
  templateUrl: './affectation-form-dialog.html',
  styleUrl: './affectation-form-dialog.scss',
})
export class AffectationFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private affectationService = inject(AffectationService);
  private vehiculeService = inject(VehiculeService);
  private conducteurService = inject(ConducteurService);
  private dialogRef = inject(MatDialogRef<AffectationFormDialogComponent>);
  data: AffectationFormData = inject(MAT_DIALOG_DATA, { optional: true }) || {};

  isSaving = false;
  errorMessage: string | null = null;
  vehicules: VehiculeListItem[] = [];
  conducteurs: Conducteur[] = [];
  vehiculeVerrouille = !!this.data?.vehiculeId;

  form = this.fb.group({
    vehicule: [this.data?.vehiculeId || '', Validators.required],
    conducteur: ['', Validators.required],
    date_debut: [new Date(), Validators.required],
    motif: [''],
  });

  ngOnInit(): void {
    if (!this.vehiculeVerrouille) {
      this.vehiculeService.list({ page_size: 200, disponible: true }).subscribe({
        next: (response) => (this.vehicules = response.results),
        error: () => undefined,
      });
    }
    this.conducteurService.list({ page_size: 100 }).subscribe({
      next: (response) => (this.conducteurs = response.results),
      error: () => undefined,
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;

    const raw = this.form.value;
    const payload: Partial<Affectation> = {
      vehicule: raw.vehicule!,
      conducteur: raw.conducteur!,
      date_debut: (raw.date_debut as Date).toISOString().split('T')[0],
      motif: raw.motif || '',
    };

    this.affectationService.create(payload).subscribe({
      next: (affectation) => {
        this.isSaving = false;
        this.dialogRef.close(affectation);
      },
      error: (err) => {
        this.isSaving = false;
        // La contrainte unique côté Django renvoie une erreur non-field si le
        // véhicule a déjà une affectation active — message explicite ici.
        const nonFieldError = err?.error?.non_field_errors?.[0];
        this.errorMessage = nonFieldError
          ? "Ce véhicule a déjà un conducteur actif. Termine d'abord l'affectation en cours."
          : 'Une erreur est survenue lors de la création.';
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
