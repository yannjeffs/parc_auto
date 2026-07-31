import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceFormDialogComponent } from './maintenance-form-dialog';
import { commonTestProviders, mockDialogProviders } from '../test-provider';

describe('MaintenanceFormDialogComponent', () => {
  let component: MaintenanceFormDialogComponent;
  let fixture: ComponentFixture<MaintenanceFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceFormDialogComponent],
      providers: [
        ...commonTestProviders,
        ...mockDialogProviders(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
