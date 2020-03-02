import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {FlightSearchingComponent} from './results/flight-searching/flight-searching.component';
import {EventSearchingComponent} from './results/event-searching/event-searching.component';
import {FlightTicketDetailsComponent} from './tickets/flight-ticket-details/flight-ticket-details.component';
import {EventSportDetailsComponent} from './templates/search/event-sport/event-sport-details/event-sport-details.component';
import {PrintFlightTicketComponent} from './templates/print-flight-ticket/print-flight-ticket.component';
import {BoatResultComponent} from './templates/search/boat/boat-result/boat-result.component';
import {BusResultComponent} from './templates/search/bus/bus-result/bus-result.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'search',
    children: [
      {
        path: 'flights',
        component: FlightSearchingComponent
      },
      {
        path: 'events',
        component: EventSearchingComponent
      },
      {
        path: 'cruise',
        component: BoatResultComponent
      },
      {
        path: 'bus',
        component: BusResultComponent
      }
    ]
  },
  {
    path: 'details',
    children: [
      {
        path: 'flight',
        component: FlightTicketDetailsComponent
      },
      {
        path: 'event/:id',
        component: EventSportDetailsComponent
      }
    ]
  },
  {
    path: 'print/flight',
    component: PrintFlightTicketComponent
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
