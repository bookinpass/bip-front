import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EventSportResultComponent} from '../../results/event-sport/event-sport-result.component';
import {BoatResultComponent} from '../../results/boat/boat-result.component';
import {BusResultComponent} from '../../results/bus/bus-result.component';


const routes: Routes = [
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
export class SearchResultRoutingModule {
}
