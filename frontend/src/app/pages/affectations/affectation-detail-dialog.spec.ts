import { AffectationDetailDialogComponent } from './affectation-detail-dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';


describe('VehiculeListComponent', () => {
  let component: AffectationDetailDialogComponent;
  let fixture: ComponentFixture<AffectationDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AffectationDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AffectationDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
