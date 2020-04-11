import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {EventSportDetailsRoutingModule} from './event-sport-details-routing.module';
import {EventSportDetailsComponent} from '../../events-sport/event-sport-details/event-sport-details.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SweetAlert2Module} from '@sweetalert2/ngx-sweetalert2';
import {RecaptchaFormsModule, RecaptchaModule} from 'ng-recaptcha';
import {PaymentModule} from '../payment/payment.module';


@NgModule({
  declarations: [
    EventSportDetailsComponent
  ],
  imports: [
    CommonModule,
    EventSportDetailsRoutingModule,
    FormsModule,
    SweetAlert2Module.forRoot(),
    RecaptchaModule,
    RecaptchaFormsModule,
    ReactiveFormsModule,
    PaymentModule,
  ]
})
export class EventSportDetailsModule {
}
