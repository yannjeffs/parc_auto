import { Component, inject } from '@angular/core';
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

import { ConducteurService } from '../core/services/conducteur.service';
import { Conducteur, CategoriePermis, StatutConducteur } from '../models/conducteur.model';

export interface ConducteurFormData {
  conducteur?: Conducteur;
}

const CATEGORIE_OPTIONS: { value: CategoriePermis; label: string }[] = [
  { value: 'A', label: 'A — Moto' },
  { value: 'B', label: 'B — Véhicule léger' },
  { value: 'C', label: 'C — Poids lourd' },
  { value: 'D', label: 'D — Transport en commun' },
  { value: 'EB', label: 'EB — Remorque' },
];

const STATUT_OPTIONS: { value: StatutConducteur; label: string }[] = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'en_mission', label: 'En mission' },
  { value: 'en_conge', label: 'En congé' },
  { value: 'suspendu', label: 'Suspendu' },
];

@Component({
  selector: 'app-conducteur-form-dialog',
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
  templateUrl: './conducteur-form-dialog.html',
  styleUrl: './conducteur-form-dialog.scss',
})
export class ConducteurFormDialogComponent {
  private fb = inject(FormBuilder);
  private conducteurService = inject(ConducteurService);
  private dialogRef = inject(MatDialogRef<ConducteurFormDialogComponent>);
  data: ConducteurFormData = inject(MAT_DIALOG_DATA);

  isEdition = !!this.data?.conducteur;
  isSaving = false;
  errorMessage: string | null = null;

  categorieOptions = CATEGORIE_OPTIONS;
  statutOptions = STATUT_OPTIONS;

  form = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    telephone: ['', [Validators.required, Validators.pattern(/^\+?[0-9 ]{9,15}$/)]],
    numero_permis: ['', [Validators.required, Validators.minLength(4)]],
    categorie_permis: ['B' as CategoriePermis, Validators.required],
    date_expiration_permis: [new Date(), Validators.required],
    date_embauche: [new Date(), Validators.required],
    statut: ['disponible' as StatutConducteur, Validators.required],
  });

  constructor() {
    if (this.data?.conducteur) {
      const c = this.data.conducteur;
      this.form.patchValue({
        nom: c.nom,
        prenom: c.prenom,
        telephone: c.telephone,
        numero_permis: c.numero_permis,
        categorie_permis: c.categorie_permis,
        date_expiration_permis: new Date(c.date_expiration_permis),
        date_embauche: new Date(c.date_embauche),
        statut: c.statut,
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
    const payload: Partial<Conducteur> = {
      ...raw,
      date_expiration_permis: (raw.date_expiration_permis as Date).toISOString().split('T')[0],
      date_embauche: (raw.date_embauche as Date).toISOString().split('T')[0],
    } as Partial<Conducteur>;

    const request$ = this.isEdition
      ? this.conducteurService.update(this.data.conducteur!.id, payload)
      : this.conducteurService.create(payload);

    request$.subscribe({
      next: (conducteur) => {
        this.isSaving = false;
        this.dialogRef.close(conducteur);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage =
          err?.error?.numero_permis?.[0] ||
          'Une erreur est survenue. Le numéro de permis est peut-être déjà utilisé.';
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}