import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Alerte, AlertesService } from '../../core/services/alertes.service';


@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.scss',
})
export class NotificationBellComponent implements OnInit {
  private alertesService = inject(AlertesService);

  alertes: Alerte[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.rafraichir();
  }

  rafraichir(): void {
    this.isLoading = true;
    this.alertesService.getAlertes().subscribe({
      next: (alertes) => {
        this.alertes = alertes;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}
