import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilisateurFormDialogComponent } from './utilisateur-form-dialog';

describe('UtilisateurFormDialog', () => {
  let component: UtilisateurFormDialogComponent;
  let fixture: ComponentFixture<UtilisateurFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilisateurFormDialogComponent]
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
