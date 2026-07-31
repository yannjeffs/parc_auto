import { commonTestProviders, mockDialogProviders } from '../../test-provider';
import { AffectationListComponent } from './affectation-list';
import { ComponentFixture, TestBed } from '@angular/core/testing';


describe('AffectationListComponent', () => {
  let component: AffectationListComponent;
  let fixture: ComponentFixture<AffectationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AffectationListComponent],
      providers: [
        ...commonTestProviders,
        ...mockDialogProviders(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AffectationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
