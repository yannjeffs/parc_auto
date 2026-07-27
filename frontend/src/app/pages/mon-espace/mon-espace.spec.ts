import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonEspace } from './mon-espace';

describe('MonEspace', () => {
  let component: MonEspace;
  let fixture: ComponentFixture<MonEspace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonEspace]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonEspace);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
