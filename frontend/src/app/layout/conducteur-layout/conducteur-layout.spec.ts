import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConducteurLayout } from './conducteur-layout';

describe('ConducteurLayout', () => {
  let component: ConducteurLayout;
  let fixture: ComponentFixture<ConducteurLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConducteurLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConducteurLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
