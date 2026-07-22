import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarburantList } from './carburant-list';

describe('CarburantList', () => {
  let component: CarburantList;
  let fixture: ComponentFixture<CarburantList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarburantList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarburantList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
