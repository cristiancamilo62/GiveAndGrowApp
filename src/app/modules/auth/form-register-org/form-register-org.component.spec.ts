import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRegisterOrgComponent } from './form-register-org.component';

describe('FormRegisterOrgComponent', () => {
  let component: FormRegisterOrgComponent;
  let fixture: ComponentFixture<FormRegisterOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormRegisterOrgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormRegisterOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
