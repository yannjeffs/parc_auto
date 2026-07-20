import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  succes(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 4000,
      panelClass: ['notification-succes'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  erreur(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 6000,
      panelClass: ['notification-erreur'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  info(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  /** Extrait un message lisible d'une erreur HTTP DRF, avec un message par défaut en repli. */
  messageErreurApi(err: unknown, messageParDefaut: string): string {
    const error = (err as { error?: unknown })?.error;
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object') {
      const premiereCle = Object.keys(error)[0];
      const valeur = (error as Record<string, unknown>)[premiereCle];
      if (Array.isArray(valeur) && typeof valeur[0] === 'string') {
        return valeur[0];
      }
      if (typeof valeur === 'string') return valeur;
    }
    return messageParDefaut;
  }
}
