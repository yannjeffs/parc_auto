import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehiculeFormDialogComponent } from './vehicule-form-dialog';


describe('VehiculeListComponent', () => {
  let component: VehiculeFormDialogComponent;
  let fixture: ComponentFixture<VehiculeFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculeFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculeFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
