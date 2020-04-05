import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AccountRoutingModule} from './account-routing.module';
import {MyTicketsComponent} from '../../users/my-tickets/my-tickets.component';
import {MyAccountComponent} from '../../users/my-account/my-account.component';
import {DetailsTicketComponent} from '../../users/my-tickets/details-ticket/details-ticket.component';
import {MatDialogModule} from "@angular/material/dialog";
import {FormsModule} from "@angular/forms";


@NgModule({
  declarations: [
    MyTicketsComponent,
    MyAccountComponent,
    DetailsTicketComponent
  ],
  imports: [
    CommonModule,
    AccountRoutingModule,
    MatDialogModule,
    FormsModule
  ],
  exports: [], entryComponents: [], providers: []
})
export class AccountModule {
}
