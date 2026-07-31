import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConducteurListComponent } from './conducteur-list';
import { commonTestProviders } from '../test-provider';

describe('ConducteurListComponent', () => {
  let component: ConducteurListComponent;
  let fixture: ComponentFixture<ConducteurListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConducteurListComponent],
      providers: [
        ...commonTestProviders
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConducteurListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
