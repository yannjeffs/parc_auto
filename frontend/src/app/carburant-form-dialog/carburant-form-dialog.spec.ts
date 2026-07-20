import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarburantFormDialog } from './carburant-form-dialog';

describe('CarburantFormDialog', () => {
  let component: CarburantFormDialog;
  let fixture: ComponentFixture<CarburantFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarburantFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarburantFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
