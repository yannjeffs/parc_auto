import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculeDetailComponent } from './vehicule-detail';
import { commonTestProviders } from '../test-provider';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

describe('VehiculeDetailComponent', () => {
  let component: VehiculeDetailComponent;
  let fixture: ComponentFixture<VehiculeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculeDetailComponent],
      providers: [
        ...commonTestProviders,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: '1' }) },
            paramMap: of(convertToParamMap({ id: '1' })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VehiculeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
