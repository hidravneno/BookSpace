import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MySpacesPage } from './my-spaces.page';

describe('MySpacesPage', () => {
  let component: MySpacesPage;
  let fixture: ComponentFixture<MySpacesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MySpacesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
