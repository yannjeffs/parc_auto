import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentFormDialog } from './document-form-dialog';

describe('DocumentFormDialog', () => {
  let component: DocumentFormDialog;
  let fixture: ComponentFixture<DocumentFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
