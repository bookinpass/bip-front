import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MyTicketsComponent} from '../../users/my-tickets/my-tickets.component';
import {MyAccountComponent} from '../../users/my-account/my-account.component';

const routes: Routes = [
  {
    path: 'mytickets',
    component: MyTicketsComponent
  },
  {
    path: 'myaccount',
    component: MyAccountComponent
  },
  {
    path: '**',
    redirectTo: 'mytickets',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule {
}
