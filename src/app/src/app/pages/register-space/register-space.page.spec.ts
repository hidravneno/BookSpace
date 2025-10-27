import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterSpacePage } from './register-space.page';

describe('RegisterSpacePage', () => {
  let component: RegisterSpacePage;
  let fixture: ComponentFixture<RegisterSpacePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterSpacePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
