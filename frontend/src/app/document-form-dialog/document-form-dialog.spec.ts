import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentFormDialogComponent } from './document-form-dialog';
import { commonTestProviders, mockDialogProviders } from '../test-provider';

describe('DocumentFormDialogComponent', () => {
  let component: DocumentFormDialogComponent;
  let fixture: ComponentFixture<DocumentFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentFormDialogComponent],
      providers: [
        ...commonTestProviders,
        ...mockDialogProviders()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
