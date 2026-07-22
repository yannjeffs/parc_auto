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

import { CarburantService } from '../core/services/carburant.service';
import { ConducteurService } from '../core/services/conducteur.service';
import { VehiculeService } from '../core/services/vehicule.service';
import { PleinCarburant } from '../models/carburant.model';
import { Conducteur } from '../models/conducteur.model';
import { VehiculeListItem } from '../models/vehicule.model';

export interface CarburantFormData {
  vehiculeId?: string;
  plein?: PleinCarburant;
}

@Component({
  selector: 'app-carburant-form-dialog',
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
  templateUrl: './carburant-form-dialog.html',
  styleUrl: './carburant-form-dialog.scss',
})
export class CarburantFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private carburantService = inject(CarburantService);
  private conducteurService = inject(ConducteurService);
  private vehiculeService = inject(VehiculeService);
  private dialogRef = inject(MatDialogRef<CarburantFormDialogComponent>);
  data: CarburantFormData = inject(MAT_DIALOG_DATA);

  isEdition = !!this.data?.plein;
  vehiculeLibre = !this.data?.vehiculeId && !this.data?.plein;
  isSaving = false;
  errorMessage: string | null = null;
  conducteurs: Conducteur[] = [];
  vehicules: VehiculeListItem[] = [];

  form = this.fb.group({
    vehicule: [this.data?.vehiculeId || '', Validators.required],
    date_plein: [new Date(), Validators.required],
    litres: [0, [Validators.required, Validators.min(0.1)]],
    cout_total: [0, [Validators.required, Validators.min(0)]],
    kilometrage_au_plein: [0, [Validators.required, Validators.min(0)]],
    station: [''],
    conducteur: [null as string | null],
  });

  constructor() {
    if (this.data?.plein) {
      const p = this.data.plein;
      this.form.patchValue({
        vehicule: p.vehicule,
        date_plein: new Date(p.date_plein),
        litres: Number(p.litres),
        cout_total: Number(p.cout_total),
        kilometrage_au_plein: p.kilometrage_au_plein,
        station: p.station,
        conducteur: p.conducteur,
      });
    }
  }

  ngOnInit(): void {
    this.conducteurService.list({ page_size: 100 }).subscribe({
      next: (response) => (this.conducteurs = response.results),
      error: () => undefined,
    });
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
    const payload: Partial<PleinCarburant> = {
      ...raw,
      date_plein: (raw.date_plein as Date).toISOString(),
      litres: String(raw.litres),
      cout_total: String(raw.cout_total),
    } as unknown as Partial<PleinCarburant>;

    const request$ = this.isEdition
      ? this.carburantService.update(this.data.plein!.id, payload)
      : this.carburantService.create(payload);

    request$.subscribe({
      next: (plein) => {
        this.isSaving = false;
        this.dialogRef.close(plein);
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