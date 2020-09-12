import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PrintingRoutingModule} from './printing-routing.module';
import {PrintFlightTicketComponent} from '../../flights/print-flight-ticket/print-flight-ticket.component';


@NgModule({
  declarations: [
    PrintFlightTicketComponent
  ],
  imports: [
    CommonModule,
    PrintingRoutingModule
  ]
})
export class PrintingModule {
}
