import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './login/login';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { DashboardComponent } from './dashboard/dashboard';
import { VehiculeListComponent } from './vehicule-list/vehicule-list';
import { VehiculeDetailComponent } from './vehicule-detail/vehicule-detail';
import { ConducteurListComponent } from './conducteurs/conducteur-list';
import { AffectationListComponent } from './pages/affectations/affectation-list';
import { MaintenanceListComponent } from './maintenance-list/maintenance-list';
import { CarburantListComponent } from './carburant-list/carburant-list';
import { DocumentListComponent } from './document-list/document-list';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'vehicules', component: VehiculeListComponent },
      { path: 'vehicules/:id', component: VehiculeDetailComponent },
      { path: 'conducteurs', component: ConducteurListComponent },
      { path: 'affectations', component: AffectationListComponent },
      { path: 'maintenance', component: MaintenanceListComponent },
      { path: 'carburant', component: CarburantListComponent },
      { path: 'documents', component: DocumentListComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];