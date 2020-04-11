import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AccountRoutingModule} from './account-routing.module';
import {MyTicketsComponent} from '../../users/my-tickets/my-tickets.component';
import {MyAccountComponent} from '../../users/my-account/my-account.component';
import {DetailsTicketComponent} from '../../users/my-tickets/details-ticket/details-ticket.component';
import {MatDialogModule} from '@angular/material/dialog';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatTooltipModule} from '@angular/material/tooltip';
import {EditPasswordComponent} from '../../users/my-account/edit-password/edit-password.component';


@NgModule({
  declarations: [
    MyTicketsComponent,
    MyAccountComponent,
    DetailsTicketComponent,
    EditPasswordComponent
  ],
  imports: [
    CommonModule,
    AccountRoutingModule,
    MatDialogModule,
    FormsModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  exports: [], entryComponents: [], providers: []
})
export class AccountModule {
}
