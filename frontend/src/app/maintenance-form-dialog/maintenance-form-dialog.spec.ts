import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceFormDialog } from './maintenance-form-dialog';

describe('MaintenanceFormDialog', () => {
  let component: MaintenanceFormDialog;
  let fixture: ComponentFixture<MaintenanceFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
