import { commonTestProviders, mockDialogProviders } from '../../test-provider';
import { AffectationFormDialogComponent } from './affectation-form-dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';


describe('AffectationFormDialogComponent', () => {
  let component: AffectationFormDialogComponent;
  let fixture: ComponentFixture<AffectationFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AffectationFormDialogComponent],
      providers: [
        ...commonTestProviders,
        ...mockDialogProviders(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AffectationFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
