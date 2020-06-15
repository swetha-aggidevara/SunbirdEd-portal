import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingFrameworkComponent } from './onboarding-framework.component';

describe('OnboardingFrameworkComponent', () => {
  let component: OnboardingFrameworkComponent;
  let fixture: ComponentFixture<OnboardingFrameworkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnboardingFrameworkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingFrameworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
