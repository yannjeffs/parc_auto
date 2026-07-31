import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilisateurListComponent } from './utilisateur-list';
import { commonTestProviders, mockDialogProviders } from '../test-provider';

describe('UtilisateurListComponent', () => {
  let component: UtilisateurListComponent;
  let fixture: ComponentFixture<UtilisateurListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilisateurListComponent],
      providers: [
        ...commonTestProviders,
        ...mockDialogProviders(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilisateurListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
