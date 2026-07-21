import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private router = inject(Router);
  private breakpointObserver = inject(BreakpointObserver);
  private breakpointSub?: Subscription;

  navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard' },
    { label: 'Véhicules', icon: 'directions_car', route: '/vehicules' },
    { label: 'Conducteurs', icon: 'badge', route: '/conducteurs' },
    { label: 'Affectations', icon: 'assignment_ind', route: '/affectations' },
    { label: 'Maintenance', icon: 'build', route: '/maintenance' },
    { label: 'Carburant', icon: 'local_gas_station', route: '/carburant' },
    { label: 'Documents', icon: 'description', route: '/documents' },
  ];

  // Propriété simple mise à jour par abonnement — évite le piège du
  // `@if (obs | async; as x)` où la valeur émise (false = desktop) sert
  // aussi de condition d'affichage et masque tout le bloc à tort.
  isMobile = false;

  get roleLabel(): string {
    switch (this.authService.getRole()) {
      case 'admin': return 'Administrateur';
      case 'gestionnaire': return 'Gestionnaire';
      case 'lecture_seule': return 'Lecture seule';
      default: return '';
    }
  }

  ngOnInit(): void {
    this.breakpointSub = this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
  }

  ngOnDestroy(): void {
    this.breakpointSub?.unsubscribe();
  }

  /** Ferme le menu après un clic sur un lien, mais uniquement en mode "over" (mobile) */
  fermerSiMobile(sidenav: MatSidenav): void {
    if (this.isMobile) {
      sidenav.close();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
