import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, LOCALE_ID, NgModule} from '@angular/core';
import '../assets/prototypes/string-prototypes';
import '../assets/prototypes/array-prototypes';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HeaderComponent} from './templates/header/header.component';
import {FooterComponent} from './templates/footer/footer.component';
import {TicketSearchingComponent} from './templates/ticket-searching/ticket-searching.component';
import {HomeComponent} from './home/home.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatNativeDateModule} from '@angular/material/core';
import {SweetAlert2Module} from '@sweetalert2/ngx-sweetalert2';
import {CurrencyPipe, DatePipe, registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {FlightSearchingComponent} from './results/flight-searching/flight-searching.component';
import {EventSearchingComponent} from './results/event-searching/event-searching.component';
import {FileUploadModule} from 'ng2-file-upload';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {AsideFilterComponent} from './results/flight-searching/aside-filter/aside-filter.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {FlightItineraryComponent} from './results/flight-searching/flight-itinerary/flight-itinerary.component';
import {MatDialogModule} from '@angular/material/dialog';
import {FlightTicketDetailsComponent} from './tickets/flight-ticket-details/flight-ticket-details.component';
import {EventSportDetailsComponent} from './templates/search/event-sport/event-sport-details/event-sport-details.component';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import {LoginComponent} from './users/login/login.component';
import {RegisterComponent} from './users/register/register.component';
import {MatSelectModule} from '@angular/material/select';
import {CookieService} from 'ngx-cookie-service';
import {JwtModule} from '@auth0/angular-jwt';
import {GlobalErrorHandlerService} from './core/error/global-error-handler.service';
import {MatStepperModule} from '@angular/material/stepper';
import {MatIconModule} from '@angular/material/icon';
import {TicketDetailsComponent} from './templates/ticket-details/ticket-details.component';
// make jquery to be available globally
import * as $ from 'jquery';
import {AddressesComponent} from './tickets/flight-ticket-details/addresses/addresses.component';
import {InCashComponent} from './core/payments/in-cash/in-cash.component';
import {NgxPayPalModule} from 'ngx-paypal';
import {FomanticUIModule} from 'ngx-fomantic-ui';
import {TagInputModule} from 'ngx-chips';
import {TrendPreferenceComponent} from './templates/trend-preference/trend-preference.component';
import {TravelAsideComponent} from './tickets/travel-aside/travel-aside.component';
import {PrintFlightTicketComponent} from './templates/print-flight-ticket/print-flight-ticket.component';
import {FlightsComponent} from './templates/search/flights/flights.component';
import {EventSportComponent} from './templates/search/event-sport/event-sport.component';
import {BoatComponent} from './templates/search/boat/boat.component';
import {BoatResultComponent} from './templates/search/boat/boat-result/boat-result.component';
import {CalendarModule, DateAdapter} from 'angular-calendar';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';
import {QRCodeModule} from 'angularx-qrcode';
import {GeneralConditionComponent} from './core/modal/general-condition/general-condition.component';
import {BusComponent} from './templates/search/bus/bus.component';
import {BusResultComponent} from './templates/search/bus/bus-result/bus-result.component';
import {RecaptchaModule} from 'ng-recaptcha';
import {CorePaymentV2Component} from './core/core-payment-v2/core-payment-v2.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {HomeBannerComponent} from './advertising/home-banner/home-banner.component';
import {EPaymentComponent} from './core/payments/e-payment/e-payment.component';
import {SlideshowModule} from 'ng-simple-slideshow';
import {SidebarModule} from 'ng-sidebar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {ChooseFlightDialogComponent} from './templates/trend-preference/choose-flight-dialog/choose-flight-dialog.component';
import {TokenInterceptor} from './core/Interceptors/token-interceptor.service';

registerLocaleData(localeFr);

export function tokenGetter() {
  return localStorage.getItem('access_token');
}

// tslint:disable-next-line:no-string-literal
window['$'] = $;
// tslint:disable-next-line:no-string-literal
window['jQuery'] = $;

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    TicketSearchingComponent,
    HomeComponent,
    FlightSearchingComponent,
    EventSearchingComponent,
    AsideFilterComponent,
    FlightItineraryComponent,
    FlightTicketDetailsComponent,
    EventSportDetailsComponent,
    LoginComponent,
    RegisterComponent,
    TicketDetailsComponent,
    AddressesComponent,
    InCashComponent,
    TrendPreferenceComponent,
    TravelAsideComponent,
    PrintFlightTicketComponent,
    FlightsComponent,
    EventSportComponent,
    BoatComponent,
    BoatResultComponent,
    GeneralConditionComponent,
    BusComponent,
    BusResultComponent,
    CorePaymentV2Component,
    HomeBannerComponent,
    EPaymentComponent,
    ChooseFlightDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    FileUploadModule,
    FontAwesomeModule,
    MatButtonToggleModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatSelectModule,
    JwtModule.forRoot({
      config: {
        tokenGetter,
        headerName: 'Authorization',
        whitelistedDomains: ['http://localhost:4201', 'https://bookinpass.000webhostapp.com']
      }
    }),
    SweetAlert2Module.forRoot(),
    MatStepperModule,
    MatIconModule,
    NgxPayPalModule,
    FomanticUIModule,
    TagInputModule,
    CalendarModule.forRoot({provide: DateAdapter, useFactory: adapterFactory}),
    QRCodeModule,
    RecaptchaModule,
    MatTooltipModule,
    SlideshowModule,
    SidebarModule,
    MatSidenavModule,
  ],
  providers: [
    CurrencyPipe,
    DatePipe,
    {provide: LOCALE_ID, useValue: 'fr-SN'},
    CookieService,
    {provide: ErrorHandler, useClass: GlobalErrorHandlerService},
    {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true}
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    FlightItineraryComponent,
    RegisterComponent,
    LoginComponent,
    GeneralConditionComponent,
    EPaymentComponent,
    InCashComponent,
    ChooseFlightDialogComponent]
})

export class AppModule {
}
