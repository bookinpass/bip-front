import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AccountRoutingModule} from './account-routing.module';
import {MyTicketsComponent} from '../../users/my-tickets/my-tickets.component';
import {MyAccountComponent} from '../../users/my-account/my-account.component';


@NgModule({
  declarations: [
    MyTicketsComponent,
    MyAccountComponent
  ],
  imports: [
    CommonModule,
    AccountRoutingModule
  ],
  exports: [], entryComponents: [], providers: []
})
export class AccountModule {
}
