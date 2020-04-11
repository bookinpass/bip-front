import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {AuthGuard} from './guards/auth.guard';
import {FlightTicketDetailsComponent} from './tickets/flight-ticket-details/flight-ticket-details.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'search',
    loadChildren: () => import('./modules/search-result/search-result.module').then(module => module.SearchResultModule)
  },
  {
    path: 'details/event',
    loadChildren: () => import('./modules/event-sport-details/event-sport-details.module').then(module => module.EventSportDetailsModule)
  },
  {
    path: 'details/flight',
    component: FlightTicketDetailsComponent
  },
  {
    path: 'print',
    loadChildren: () => import('./modules/printing/printing.module').then(module => module.PrintingModule)
  },
  {
    path: 'account',
    loadChildren: () => import('./modules/account/account.module').then(module => module.AccountModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'payment',
    loadChildren: () => import('./modules/payment/payment.module').then(module => module.PaymentModule)
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
