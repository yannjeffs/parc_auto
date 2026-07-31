import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilisateurFormDialogComponent } from './utilisateur-form-dialog';
import { commonTestProviders, mockDialogProviders } from '../test-provider';

describe('UtilisateurFormDialogComponent', () => {
  let component: UtilisateurFormDialogComponent;
  let fixture: ComponentFixture<UtilisateurFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilisateurFormDialogComponent],
      providers: [
        ...commonTestProviders,
        ...mockDialogProviders(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilisateurFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
