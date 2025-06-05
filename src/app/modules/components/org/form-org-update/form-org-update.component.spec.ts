import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormOrgUpdateComponent } from './form-org-update.component';

describe('FormOrgUpdateComponent', () => {
  let component: FormOrgUpdateComponent;
  let fixture: ComponentFixture<FormOrgUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormOrgUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormOrgUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
