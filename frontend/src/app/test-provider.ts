// test-providers.ts
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

export const commonTestProviders = [
  provideHttpClient(),
  provideHttpClientTesting(),
  provideRouter([]),
];

export const mockDialogProviders = (data: unknown = {}) => [
  { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close'), afterClosed: () => of(null) } },
  { provide: MAT_DIALOG_DATA, useValue: data },
];
