import {ErrorHandler, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PaymentRoutingModule} from './payment-routing.module';
import {GlobalErrorHandlerService} from '../../core/error/global-error-handler.service';
import {FormsModule} from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {PaymentComponent} from '../../core/payment/payment.component';
import {CashPaymentComponent} from '../../core/cash-payment/cash-payment.component';


@NgModule({
  declarations: [
    PaymentComponent,
    CashPaymentComponent
  ],
  imports: [
    CommonModule,
    PaymentRoutingModule,
    FormsModule,
    MatDialogModule,
  ],
  providers: [{
    provide: ErrorHandler, useClass: GlobalErrorHandlerService
  }],
  exports: [
    PaymentComponent
  ]
})
export class PaymentModule {
}
