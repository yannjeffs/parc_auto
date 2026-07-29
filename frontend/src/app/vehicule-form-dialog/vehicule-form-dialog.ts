import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';

import {
  Vehicule, TypeVehicule, TypeCarburant, StatutVehicule, TypeTransmission, TypeTraction,
} from '../models/vehicule.model';
import { VehiculeService } from '../core/services/vehicule.service';

export interface VehiculeFormData {
  vehicule?: Vehicule;
}

const TYPE_VEHICULE_OPTIONS: { value: TypeVehicule; label: string }[] = [
  { value: 'berline', label: 'Berline' },
  { value: 'suv', label: 'SUV' },
  { value: 'utilitaire', label: 'Utilitaire' },
  { value: 'camion', label: 'Camion' },
  { value: 'moto', label: 'Moto' },
  { value: 'bus', label: 'Bus / Minibus' },
];

const TYPE_CARBURANT_OPTIONS: { value: TypeCarburant; label: string }[] = [
  { value: 'essence', label: 'Essence' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'hybride', label: 'Hybride' },
  { value: 'electrique', label: 'Électrique' },
];

const STATUT_OPTIONS: { value: StatutVehicule; label: string }[] = [
  { value: 'en_service', label: 'En service' },
  { value: 'en_maintenance', label: 'En maintenance' },
  { value: 'en_panne', label: 'En panne' },
  { value: 'hors_service', label: 'Hors service' },
  { value: 'vendu', label: 'Vendu' },
];

const TRANSMISSION_OPTIONS: { value: TypeTransmission; label: string }[] = [
  { value: 'Manuelle', label: 'Manuelle' },
  { value: 'Automatique', label: 'Automatique' },
];

const TRACTION_OPTIONS: { value: TypeTraction; label: string }[] = [
  { value: 'FWD', label: 'FWD (traction avant)' },
  { value: 'RWD', label: 'RWD (propulsion arrière)' },
  { value: '4x4', label: '4x4' },
  { value: 'AWD', label: 'AWD (transmission intégrale)' },
];

@Component({
  selector: 'app-vehicule-form-dialog',
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
    MatDatepickerModule,
    MatIconModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './vehicule-form-dialog.html',
  styleUrl: './vehicule-form-dialog.scss',
})
export class VehiculeFormDialogComponent {
  private fb = inject(FormBuilder);
  private vehiculeService = inject(VehiculeService);
  private dialogRef = inject(MatDialogRef<VehiculeFormDialogComponent>);
  data: VehiculeFormData = inject(MAT_DIALOG_DATA);

  isEdition = !!this.data?.vehicule;
  isSaving = false;
  errorMessage: string | null = null;

  typeVehiculeOptions = TYPE_VEHICULE_OPTIONS;
  typeCarburantOptions = TYPE_CARBURANT_OPTIONS;
  statutOptions = STATUT_OPTIONS;
  transmissionOptions = TRANSMISSION_OPTIONS;
  tractionOptions = TRACTION_OPTIONS;

  form = this.fb.group({
    immatriculation: ['', [Validators.required, Validators.pattern(/^[A-Z0-9 -]{4,15}$/i)]],
    numero_chassis: ['', [Validators.required, Validators.minLength(5)]],
    marque: ['', Validators.required],
    modele: ['', Validators.required],
    annee: [
      new Date().getFullYear(),
      [Validators.required, Validators.min(1980), Validators.max(new Date().getFullYear() + 1)],
    ],
    type_vehicule: ['berline' as TypeVehicule, Validators.required],
    type_carburant: ['essence' as TypeCarburant, Validators.required],
    nombre_places: [5, [Validators.required, Validators.min(1), Validators.max(9)]],
    statut: ['en_service' as StatutVehicule, Validators.required],
    kilometrage_actuel: [0, [Validators.required, Validators.min(0), Validators.max(2000000)]],
    site_affectation: [''],
    date_acquisition: [new Date(), Validators.required],
    prix_acquisition: [0, [Validators.required, Validators.min(1)]],
    cylindree_cm3: [null as number | null, [Validators.min(0)]],
    transmission: [null as TypeTransmission | null],
    traction: [null as TypeTraction | null],
    puissance_ch: [null as number | null, [Validators.min(0)]],
  });

  selectedPhotoFile: File | null = null;
  photoPreviewUrl: string | null = null;

  constructor() {
    if (this.data?.vehicule) {
      const v = this.data.vehicule;
      this.photoPreviewUrl = v.photo;
      this.form.patchValue({
        immatriculation: v.immatriculation,
        numero_chassis: v.numero_chassis,
        marque: v.marque,
        modele: v.modele,
        annee: v.annee,
        type_vehicule: v.type_vehicule,
        type_carburant: v.type_carburant,
        nombre_places: v.nombre_places,
        statut: v.statut,
        kilometrage_actuel: v.kilometrage_actuel,
        site_affectation: v.site_affectation,
        date_acquisition: new Date(v.date_acquisition),
        prix_acquisition: Number(v.prix_acquisition),
        cylindree_cm3: v.cylindree_cm3,
        transmission: v.caracteristiques?.transmission ?? null,
        traction: v.caracteristiques?.traction ?? null,
        puissance_ch: v.caracteristiques?.puissance_ch ?? null,
      });
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Le fichier sélectionné doit être une image.';
      return;
    }

    this.selectedPhotoFile = file;
    this.photoPreviewUrl = URL.createObjectURL(file);
    this.errorMessage = null;
  }

  removePhoto(): void {
    this.selectedPhotoFile = null;
    this.photoPreviewUrl = null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;

    const raw = this.form.value;
    const { transmission, traction, puissance_ch, ...reste } = raw;
    const payload: Partial<Vehicule> = {
      ...reste,
      date_acquisition: (raw.date_acquisition as Date).toISOString().split('T')[0],
      prix_acquisition: String(raw.prix_acquisition),
      caracteristiques: {
        ...(transmission ? { transmission } : {}),
        ...(traction ? { traction } : {}),
        ...(puissance_ch ? { puissance_ch } : {}),
      },
    } as Partial<Vehicule>;

    const request$ = this.isEdition
      ? this.vehiculeService.update(this.data.vehicule!.id, payload)
      : this.vehiculeService.create(payload);

    request$.subscribe({
      next: (vehicule) => {
        // Si une nouvelle photo a été choisie, on l'envoie dans un second appel
        // (multipart séparé du reste des champs, plus simple à gérer côté DRF)
        if (this.selectedPhotoFile) {
          this.vehiculeService.uploadPhoto(vehicule.id, this.selectedPhotoFile).subscribe({
            next: (vehiculeAvecPhoto) => {
              this.isSaving = false;
              this.dialogRef.close(vehiculeAvecPhoto);
            },
            error: () => {
              this.isSaving = false;
              // Le véhicule est bien enregistré, seule la photo a échoué à l'upload
              this.errorMessage = 'Véhicule enregistré, mais l\'envoi de la photo a échoué.';
              this.dialogRef.close(vehicule);
            },
          });
        } else {
          this.isSaving = false;
          this.dialogRef.close(vehicule);
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage =
          err?.error?.immatriculation?.[0] ||
          err?.error?.numero_chassis?.[0] ||
          'Une erreur est survenue. Vérifie les champs (immatriculation ou n° châssis déjà utilisé ?).';
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
