import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsprofileComponent } from './detailsprofile.component';

describe('DetailsprofileComponent', () => {
  let component: DetailsprofileComponent;
  let fixture: ComponentFixture<DetailsprofileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsprofileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
