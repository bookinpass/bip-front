import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SearchResultRoutingModule} from './search-result-routing.module';
import {FlightResultComponent} from '../../results/flight/flight-result.component';
import {FlightItineraryComponent} from '../../results/flight/flight-itinerary/flight-itinerary.component';
import {AsideFilterComponent} from '../../results/flight/aside-filter/aside-filter.component';
import {EventSportResultComponent} from '../../results/event-sport/event-sport-result.component';
import {BusResultComponent} from '../../results/bus/bus-result.component';
import {BoatResultComponent} from '../../results/boat/boat-result.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {QRCodeModule} from 'angularx-qrcode';
import {CalendarModule, DateAdapter} from 'angular-calendar';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';
import {PaymentModule} from '../payment/payment.module';

@NgModule({
  declarations: [
    FlightResultComponent,
    FlightItineraryComponent,
    AsideFilterComponent,
    EventSportResultComponent,
    BusResultComponent,
    BoatResultComponent
  ],
  imports: [
    CommonModule,
    SearchResultRoutingModule,
    FormsModule,
    FontAwesomeModule,
    MatDialogModule,
    MatButtonToggleModule,
    QRCodeModule,
    CalendarModule.forRoot({provide: DateAdapter, useFactory: adapterFactory}),
    ReactiveFormsModule,
    PaymentModule
  ]
})
export class SearchResultModule {
}
