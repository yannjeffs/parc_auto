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

import { DocumentService } from '../core/services/document.service';
import { VehiculeService } from '../core/services/vehicule.service';
import { DocumentVehicule, TypeDocument } from '../models/document.model';
import { VehiculeListItem } from '../models/vehicule.model';

export interface DocumentFormData {
  vehiculeId?: string;
  document?: DocumentVehicule;
}

const TYPE_OPTIONS: { value: TypeDocument; label: string }[] = [
  { value: 'assurance', label: 'Assurance' },
  { value: 'visite_technique', label: 'Visite technique' },
  { value: 'carte_grise', label: 'Carte grise' },
  { value: 'vignette', label: 'Vignette' },
  { value: 'autre', label: 'Autre' },
];

@Component({
  selector: 'app-document-form-dialog',
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
  templateUrl: './document-form-dialog.html',
  styleUrl: './document-form-dialog.scss',
})
export class DocumentFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private documentService = inject(DocumentService);
  private vehiculeService = inject(VehiculeService);
  private dialogRef = inject(MatDialogRef<DocumentFormDialogComponent>);
  data: DocumentFormData = inject(MAT_DIALOG_DATA);

  isEdition = !!this.data?.document;
  vehiculeLibre = !this.data?.vehiculeId && !this.data?.document;
  isSaving = false;
  errorMessage: string | null = null;
  vehicules: VehiculeListItem[] = [];

  typeOptions = TYPE_OPTIONS;

  form = this.fb.group({
    vehicule: [this.data?.vehiculeId || '', Validators.required],
    type_document: ['assurance' as TypeDocument, Validators.required],
    numero_document: [''],
    date_emission: [new Date(), Validators.required],
    date_expiration: [null as Date | null],
  });

  constructor() {
    if (this.data?.document) {
      const d = this.data.document;
      this.form.patchValue({
        vehicule: d.vehicule,
        type_document: d.type_document,
        numero_document: d.numero_document,
        date_emission: new Date(d.date_emission),
        date_expiration: d.date_expiration ? new Date(d.date_expiration) : null,
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
    const payload: Partial<DocumentVehicule> = {
      ...raw,
      date_emission: (raw.date_emission as Date).toISOString().split('T')[0],
      date_expiration: raw.date_expiration
        ? (raw.date_expiration as Date).toISOString().split('T')[0]
        : null,
    } as unknown as Partial<DocumentVehicule>;

    const request$ = this.isEdition
      ? this.documentService.update(this.data.document!.id, payload)
      : this.documentService.create(payload);

    request$.subscribe({
      next: (document) => {
        this.isSaving = false;
        this.dialogRef.close(document);
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