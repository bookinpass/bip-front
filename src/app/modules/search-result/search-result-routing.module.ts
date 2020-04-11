import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {FlightResultComponent} from '../../results/flight/flight-result.component';
import {EventSportResultComponent} from '../../results/event-sport/event-sport-result.component';
import {BoatResultComponent} from '../../results/boat/boat-result.component';
import {BusResultComponent} from '../../results/bus/bus-result.component';


const routes: Routes = [
  {
    path: 'flights',
    component: FlightResultComponent
  },
  {
    path: 'events',
    component: EventSportResultComponent
  },
  {
    path: 'cruise',
    component: BoatResultComponent
  },
  {
    path: 'bus',
    component: BusResultComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchResultRoutingModule { }
