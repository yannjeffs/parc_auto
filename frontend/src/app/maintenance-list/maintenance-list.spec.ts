import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceListComponent } from './maintenance-list';
import { commonTestProviders } from '../test-provider';

describe('MaintenanceList', () => {
  let component: MaintenanceListComponent;
  let fixture: ComponentFixture<MaintenanceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceListComponent],
      providers: [
        ...commonTestProviders
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
