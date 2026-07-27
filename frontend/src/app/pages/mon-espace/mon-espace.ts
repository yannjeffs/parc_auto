import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { provideNativeDateAdapter } from '@angular/material/core';
import { forkJoin } from 'rxjs';

import { VehiculeService } from '../../core/services/vehicule.service';
import { MaintenanceService } from '../../core/services/maintenance.service';
import { CarburantService } from '../../core/services/carburant.service';
import { DocumentService } from '../../core/services/document.service';
import { NotificationService } from '../../core/services/notification.service';

import { Vehicule } from '../../models/vehicule.model';
import { Maintenance } from '../../models/maintenance.model';
import { PleinCarburant } from '../../models/carburant.model';
import { DocumentVehicule } from '../../models/document.model';

@Component({
  selector: 'app-mon-espace',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './mon-espace.html',
  styleUrl: './mon-espace.scss',
})
export class MonEspaceComponent implements OnInit {
  private fb = inject(FormBuilder);
  private vehiculeService = inject(VehiculeService);
  private maintenanceService = inject(MaintenanceService);
  private carburantService = inject(CarburantService);
  private documentService = inject(DocumentService);
  private notification = inject(NotificationService);

  isLoading = true;
  aucunVehicule = false;
  vehicule: Vehicule | null = null;
  maintenances: Maintenance[] = [];
  pleinsCarburant: PleinCarburant[] = [];
  documents: DocumentVehicule[] = [];

  isSavingPlein = false;
  isSavingSignalement = false;

  formPlein = this.fb.group({
    date_plein: [new Date(), Validators.required],
    litres: [0, [Validators.required, Validators.min(0.1)]],
    cout_total: [0, [Validators.required, Validators.min(0)]],
    kilometrage_au_plein: [0, [Validators.required, Validators.min(0)]],
    station: [''],
  });

  formSignalement = this.fb.group({
    description: ['', Validators.required],
    date_intervention: [new Date(), Validators.required],
    kilometrage_intervention: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.vehiculeService.list({ page_size: 1 }).subscribe({
      next: (response) => {
        const item = response.results[0];
        if (!item) {
          this.aucunVehicule = true;
          this.isLoading = false;
          return;
        }
        this.chargerDetails(item.id);
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private chargerDetails(id: string): void {
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
        this.formPlein.patchValue({ kilometrage_au_plein: vehicule.kilometrage_actuel });
        this.formSignalement.patchValue({ kilometrage_intervention: vehicule.kilometrage_actuel });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  ajouterPlein(): void {
    if (this.formPlein.invalid) {
      this.formPlein.markAllAsTouched();
      return;
    }
    this.isSavingPlein = true;
    const raw = this.formPlein.value;
    this.carburantService
      .create({
        vehicule: this.vehicule!.id,
        date_plein: (raw.date_plein as Date).toISOString(),
        litres: String(raw.litres),
        cout_total: String(raw.cout_total),
        kilometrage_au_plein: raw.kilometrage_au_plein!,
        station: raw.station || '',
      })
      .subscribe({
        next: () => {
          this.isSavingPlein = false;
          this.notification.succes('Plein enregistré.');
          this.formPlein.reset({
            date_plein: new Date(),
            litres: 0,
            cout_total: 0,
            kilometrage_au_plein: this.vehicule?.kilometrage_actuel || 0,
            station: '',
          });
          if (this.vehicule) this.chargerDetails(this.vehicule.id);
        },
        error: (err) => {
          this.isSavingPlein = false;
          this.notification.erreur(
            this.notification.messageErreurApi(err, "Échec de l'enregistrement du plein."),
          );
        },
      });
  }

  signalerProbleme(): void {
    if (this.formSignalement.invalid) {
      this.formSignalement.markAllAsTouched();
      return;
    }
    this.isSavingSignalement = true;
    const raw = this.formSignalement.value;
    this.maintenanceService
      .create({
        vehicule: this.vehicule!.id,
        type_maintenance: 'curative',
        description: raw.description!,
        date_intervention: (raw.date_intervention as Date).toISOString().split('T')[0],
        kilometrage_intervention: raw.kilometrage_intervention!,
      })
      .subscribe({
        next: () => {
          this.isSavingSignalement = false;
          this.notification.succes('Problème signalé. Un gestionnaire va le traiter.');
          this.formSignalement.reset({
            description: '',
            date_intervention: new Date(),
            kilometrage_intervention: this.vehicule?.kilometrage_actuel || 0,
          });
          if (this.vehicule) this.chargerDetails(this.vehicule.id);
        },
        error: (err) => {
          this.isSavingSignalement = false;
          this.notification.erreur(
            this.notification.messageErreurApi(err, 'Échec de l\'envoi du signalement.'),
          );
        },
      });
  }
}
