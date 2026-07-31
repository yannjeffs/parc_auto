import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarburantListComponent } from './carburant-list';

describe('CarburantListComponent', () => {
  let component: CarburantListComponent;
  let fixture: ComponentFixture<CarburantListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarburantListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarburantListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
