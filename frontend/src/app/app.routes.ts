import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { CarburantListComponent } from './carburant-list/carburant-list';
import { ConducteurListComponent } from './conducteurs/conducteur-list';
import { adminGuard } from './core/guards/admin.guard';
import { conducteurGuard } from './core/guards/conducteur.guard';
import { nonConducteurGuard } from './core/guards/non-conducteur.guard';
import { DashboardComponent } from './dashboard/dashboard';
import { DocumentListComponent } from './document-list/document-list';
import { ConducteurLayoutComponent } from './layout/conducteur-layout/conducteur-layout';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { LoginComponent } from './login/login';
import { MaintenanceListComponent } from './maintenance-list/maintenance-list';
import { AffectationListComponent } from './pages/affectations/affectation-list';
import { UtilisateurListComponent } from './utilisateur-list/utilisateur-list';
import { VehiculeDetailComponent } from './vehicule-detail/vehicule-detail';
import { VehiculeListComponent } from './vehicule-list/vehicule-list';
import { MonEspaceComponent } from './pages/mon-espace/mon-espace';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard, nonConducteurGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'vehicules', component: VehiculeListComponent },
      { path: 'vehicules/:id', component: VehiculeDetailComponent },
      { path: 'conducteurs', component: ConducteurListComponent },
      { path: 'affectations', component: AffectationListComponent },
      { path: 'maintenance', component: MaintenanceListComponent },
      { path: 'carburant', component: CarburantListComponent },
      { path: 'documents', component: DocumentListComponent },
      { path: 'utilisateurs', component: UtilisateurListComponent, canActivate: [adminGuard] },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'mon-espace',
    component: ConducteurLayoutComponent,
    canActivate: [authGuard, conducteurGuard],
    children: [
      { path: 'vehicule', component: MonEspaceComponent },
      { path: '', redirectTo: 'vehicule', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
