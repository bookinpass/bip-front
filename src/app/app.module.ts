import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, LOCALE_ID, NgModule} from '@angular/core';
import localeFr from '@angular/common/locales/fr';
import '../assets/prototypes/string-prototypes';
import '../assets/prototypes/array-prototypes';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HeaderComponent} from './templates/header/header.component';
import {FooterComponent} from './templates/footer/footer.component';
import {TicketSearchingComponent} from './search-forms/ticket-searching/ticket-searching.component';
import {HomeComponent} from './search-forms/home/home.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatNativeDateModule} from '@angular/material/core';
import {SweetAlert2Module} from '@sweetalert2/ngx-sweetalert2';
import {CurrencyPipe, DatePipe, registerLocaleData, TitleCasePipe} from '@angular/common';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatDialogModule} from '@angular/material/dialog';
import {FlightTicketDetailsComponent} from './tickets/flight-ticket-details/flight-ticket-details.component';
import {MatButtonModule} from '@angular/material/button';
import {LoginComponent} from './users/login/login.component';
import {RegisterComponent} from './users/register/register.component';
import {MatSelectModule} from '@angular/material/select';
import {CookieService} from 'ngx-cookie-service';
import {JwtModule} from '@auth0/angular-jwt';
import {GlobalErrorHandlerService} from './core/error/global-error-handler.service';
import {MatIconModule} from '@angular/material/icon';
import {TicketDetailsComponent} from './templates/ticket-details/ticket-details.component';
// make jquery to be available globally
import * as $ from 'jquery';
import {AddressesComponent} from './tickets/flight-ticket-details/addresses/addresses.component';
import {TagInputModule} from 'ngx-chips';
import {TrendPreferenceComponent} from './templates/trend-preference/trend-preference.component';
import {TravelAsideComponent} from './tickets/travel-aside/travel-aside.component';
import {FlightsComponent} from './search-forms/flights/flights.component';
import {EventSportComponent} from './search-forms/event-sport/event-sport.component';
import {BoatComponent} from './search-forms/boats/boat.component';
import {GeneralConditionComponent} from './core/modal/general-condition/general-condition.component';
import {BusComponent} from './search-forms/bus/bus.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {HomeBannerComponent} from './advertising/home-banner/home-banner.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {ChooseFlightDialogComponent} from './templates/trend-preference/choose-flight-dialog/choose-flight-dialog.component';
import {MatCardModule} from '@angular/material/card';
import {NgbCarouselModule} from '@ng-bootstrap/ng-bootstrap';
import {AngularMultiSelectModule} from 'angular2-multiselect-dropdown';
import {InterceptorProviders} from './core/Interceptors/interceptorProvider';
import {PaygateResponseComponent} from './core/paygate/response/paygate-response.component';

registerLocaleData(localeFr);

export function tokenGetter() {
  return sessionStorage.getItem('access_token');
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
    HomeComponent,
    TicketSearchingComponent,
    FlightsComponent,
    BoatComponent,
    BusComponent,
    TrendPreferenceComponent,
    HomeBannerComponent,
    ChooseFlightDialogComponent,

    FlightTicketDetailsComponent,
    LoginComponent,
    RegisterComponent,
    TicketDetailsComponent,
    AddressesComponent,
    TravelAsideComponent,
    EventSportComponent,
    GeneralConditionComponent,
    PaygateResponseComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    SweetAlert2Module.forRoot(), //
    JwtModule.forRoot({
      config: {
        tokenGetter,
        headerName: 'Authorization',
        allowedDomains: ['http://localhost:4201', 'https://bookinpass.000webhostapp.com'],
        disallowedRoutes: []
      }
    }),
    MatTooltipModule,
    MatSidenavModule,
    NgbCarouselModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    TagInputModule,
    AngularMultiSelectModule
  ],
  providers: [
    CurrencyPipe,
    DatePipe,
    TitleCasePipe,
    CookieService,
    InterceptorProviders,
    {provide: ErrorHandler, useClass: GlobalErrorHandlerService},
    {provide: LOCALE_ID, useValue: 'fr-FR'}
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
