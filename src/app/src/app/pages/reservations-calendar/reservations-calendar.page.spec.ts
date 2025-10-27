import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservationsCalendarPage } from './reservations-calendar.page';

describe('ReservationsCalendarPage', () => {
  let component: ReservationsCalendarPage;
  let fixture: ComponentFixture<ReservationsCalendarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationsCalendarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
