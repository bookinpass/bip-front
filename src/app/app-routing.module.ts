import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './search-forms/home/home.component';
import {AuthGuard} from './guards/auth.guard';
import {FlightTicketDetailsComponent} from './tickets/flight-ticket-details/flight-ticket-details.component';
import {PaygateResponseComponent} from './core/paygate/response/paygate-response.component';

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
    path: 'flights',
    loadChildren: () => import('./modules/flight-search/flight-search.module').then(module => module.FlightSearchModule)
  },
  {
    path: 'details/event',
    loadChildren: () => import('./modules/result-details/result-details.module').then(module => module.ResultDetailsModule)
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
    path: 'transaction',
    loadChildren: () => import('./modules/transaction/transaction.module').then(m => m.TransactionModule)
  },
  {
    path: 'paygate/success',
    component: PaygateResponseComponent
  },
  {
    path: 'paygate/failure',
    component: PaygateResponseComponent
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
