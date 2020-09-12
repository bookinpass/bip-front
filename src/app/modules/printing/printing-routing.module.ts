import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PrintFlightTicketComponent} from '../../flights/print-flight-ticket/print-flight-ticket.component';


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
export class PrintingRoutingModule {
}
