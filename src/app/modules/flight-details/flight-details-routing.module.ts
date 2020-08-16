import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DetailsComponent} from '../../flights/details/details.component';


const routes: Routes = [
  {
    path: '',
    component: DetailsComponent
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlightDetailsRoutingModule {
}
