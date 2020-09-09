import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PaymentRoutingModule} from './payment-routing.module';
import {FormsModule} from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {PaymentComponent} from '../../core/payment/payment.component';
import {CashPaymentComponent} from '../../core/cash-payment/cash-payment.component';
import {InCashComponent} from '../../core/payments/in-cash/in-cash.component';
import {EPaymentComponent} from '../../core/payments/e-payment/e-payment.component';


@NgModule({
  declarations: [
    PaymentComponent,
    CashPaymentComponent,
    InCashComponent,
    EPaymentComponent
  ],
  exports: [
    PaymentComponent
  ],
  imports: [
    CommonModule,
    PaymentRoutingModule,
    FormsModule,
    MatDialogModule,
  ]
  // providers: [{
  //   provide: ErrorHandler, useClass: GlobalErrorHandlerService
  // }],
})
export class PaymentModule {
}
