import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PrintFlightTicketComponent} from '../../templates/print-flight-ticket/print-flight-ticket.component';


const routes: Routes = [
  {
    path: 'flight',
    component: PrintFlightTicketComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrintingRoutingModule { }
