import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { commonTestProviders, mockDialogProviders } from '../../test-provider';
import { AffectationDetailDialogComponent } from './affectation-detail-dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('AffectationDetailDialogComponent', () => {
  let component: AffectationDetailDialogComponent;
  let fixture: ComponentFixture<AffectationDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AffectationDetailDialogComponent],
      providers: [
        ...commonTestProviders,
        {
          provide: MatDialogRef,
          useValue: { close: jasmine.createSpy('close'), afterClosed: () => of(null) },
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            affectation: {
              date_debut: new Date(),
              date_fin: new Date(),
              // + les autres champs lus par le composant (vehiculeId, conducteurId, statut, etc.)
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AffectationDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
