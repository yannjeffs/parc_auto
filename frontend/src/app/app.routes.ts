import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './login/login';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { DashboardComponent } from './dashboard/dashboard';
import { VehiculeListComponent } from './vehicule-list/vehicule-list';
import { VehiculeDetailComponent } from './vehicule-detail/vehicule-detail';
import { ConducteurListComponent } from './conducteurs/conducteur-list';

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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];