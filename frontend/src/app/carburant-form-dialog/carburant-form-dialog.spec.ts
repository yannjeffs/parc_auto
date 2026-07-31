import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarburantFormDialogComponent } from './carburant-form-dialog';

describe('CarburantFormDialog', () => {
  let component: CarburantFormDialogComponent;
  let fixture: ComponentFixture<CarburantFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarburantFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarburantFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
