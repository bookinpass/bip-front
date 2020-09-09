import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SearchComponent} from '../../flights/search/search.component';

const routes: Routes = [
  {
    path: 'search',
    component: SearchComponent
  },
  {
    path: 'details',
    loadChildren: () => import('../flight-details/flight-details.module').then(m => m.FlightDetailsModule)
  },
  {
    path: '**',
    redirectTo: 'search',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlightSearchRoutingModule {
}
