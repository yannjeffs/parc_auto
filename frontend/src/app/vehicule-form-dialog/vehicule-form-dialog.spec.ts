import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehiculeFormDialogComponent } from './vehicule-form-dialog';
import { commonTestProviders, mockDialogProviders } from '../test-provider';


describe('VehiculeFormDialogComponent', () => {
  let component: VehiculeFormDialogComponent;
  let fixture: ComponentFixture<VehiculeFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculeFormDialogComponent],
      providers: [
        ...commonTestProviders,
        ...mockDialogProviders(),
      ]
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
