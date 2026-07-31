import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonEspaceComponent } from './mon-espace';

describe('MonEspaceComponent', () => {
  let component: MonEspaceComponent;
  let fixture: ComponentFixture<MonEspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonEspaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonEspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
