import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculeListComponent } from './vehicule-list';
import { commonTestProviders } from '../test-provider';

describe('VehiculeListComponent', () => {
  let component: VehiculeListComponent;
  let fixture: ComponentFixture<VehiculeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculeListComponent],
      providers: [
        ...commonTestProviders
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
