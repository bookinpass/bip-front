import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {TransactionRoutingModule} from './transaction-routing.module';
import {TransactionComponent} from '../../core/transaction/transaction.component';
import {QRCodeModule} from "angularx-qrcode";


@NgModule({
  declarations: [TransactionComponent],
  imports: [
    CommonModule,
    TransactionRoutingModule,
    QRCodeModule
  ]
})
export class TransactionModule {
}
