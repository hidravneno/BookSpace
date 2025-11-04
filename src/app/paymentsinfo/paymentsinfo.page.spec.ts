import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentsinfoPage } from './paymentsinfo.page';

describe('PaymentsinfoPage', () => {
  let component: PaymentsinfoPage;
  let fixture: ComponentFixture<PaymentsinfoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentsinfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
