import { AffectationFormDialogComponent } from './affectation-form-dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';


describe('VehiculeListComponent', () => {
  let component: AffectationFormDialogComponent;
  let fixture: ComponentFixture<AffectationFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AffectationFormDialogComponent]
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
