import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {FlightDetailsRoutingModule} from './flight-details-routing.module';
import {DetailsComponent} from '../../flights/details/details.component';
import {PassengerComponent} from '../../flights/details/passenger/passenger.component';
import {SidebarComponent} from '../../flights/details/sidebar/sidebar.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TicketResumeComponent} from '../../flights/details/ticket-resume/ticket-resume.component';
import {ConditionsComponent} from '../../flights/details/conditions/conditions.component';
import {DpDatePickerModule} from 'ng2-date-picker';

@NgModule({
  declarations: [
    DetailsComponent,
    PassengerComponent,
    SidebarComponent,
    TicketResumeComponent,
    ConditionsComponent
  ],
  imports: [
    CommonModule,
    FlightDetailsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DpDatePickerModule
  ]
})

export class FlightDetailsModule {
}
