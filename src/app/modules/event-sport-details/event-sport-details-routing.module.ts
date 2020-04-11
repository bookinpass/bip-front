import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EventSportDetailsComponent} from '../../events-sport/event-sport-details/event-sport-details.component';


const routes: Routes = [
  {
    path: ':id',
    component: EventSportDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventSportDetailsRoutingModule {
}
