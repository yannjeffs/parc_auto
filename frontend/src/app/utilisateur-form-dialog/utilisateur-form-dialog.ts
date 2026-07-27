import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { UtilisateurService } from '../core/services/utilisateur.service';
import { Utilisateur, Role } from '../models/utilisateur.model';

export interface UtilisateurFormData {
  utilisateur?: Utilisateur;
}

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'gestionnaire', label: 'Gestionnaire' },
  { value: 'lecture_seule', label: 'Lecture seule' },
  { value: 'conducteur', label: 'Conducteur' },
];

@Component({
  selector: 'app-utilisateur-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './utilisateur-form-dialog.html',
  styleUrl: './utilisateur-form-dialog.scss',
})
export class UtilisateurFormDialogComponent {
  private fb = inject(FormBuilder);
  private utilisateurService = inject(UtilisateurService);
  private dialogRef = inject(MatDialogRef<UtilisateurFormDialogComponent>);
  data: UtilisateurFormData = inject(MAT_DIALOG_DATA);

  isEdition = !!this.data?.utilisateur;
  isSaving = false;
  errorMessage: string | null = null;
  roleOptions = ROLE_OPTIONS;

  form = this.fb.group({
    username: ['', Validators.required],
    email: [''],
    password: [''],
    role_saisi: ['lecture_seule' as Role, Validators.required],
    is_active: [true],
  });

  constructor() {
    if (this.data?.utilisateur) {
      const u = this.data.utilisateur;
      this.form.patchValue({
        username: u.username,
        email: u.email,
        role_saisi: u.role,
        is_active: u.is_active,
      });
      // Le nom d'utilisateur ne se modifie pas une fois le compte créé
      this.form.controls.username.disable();
    } else {
      // Mot de passe obligatoire uniquement à la création
      this.form.controls.password.addValidators([Validators.required, Validators.minLength(8)]);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;

    const raw = this.form.getRawValue();

    const request$ = this.isEdition
      ? this.utilisateurService.update(this.data.utilisateur!.id, {
          email: raw.email || '',
          is_active: raw.is_active!,
          role_saisi: raw.role_saisi!,
          ...(raw.password ? { password: raw.password } : {}),
        })
      : this.utilisateurService.create({
          username: raw.username!,
          email: raw.email || '',
          password: raw.password!,
          role_saisi: raw.role_saisi!,
        });

    request$.subscribe({
      next: (utilisateur) => {
        this.isSaving = false;
        this.dialogRef.close(utilisateur);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage =
          err?.error?.username?.[0] ||
          err?.error?.password?.[0] ||
          "Une erreur est survenue lors de l'enregistrement.";
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
