import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AirportsJson} from '../../../assets/airports.json';
import {FlightSearchingService} from '../../services/searching/flight/flight-searching.service';
import {DomSanitizer} from '@angular/platform-browser';
import {MatDialog} from '@angular/material/dialog';
import {ClientModel} from '../../models/client.model';
import {GlobalErrorHandlerService} from '../../core/error/global-error-handler.service';
import {AuthService} from '../../services/authentication/auth.service';
import {CookiesService} from '../../services/cookie/cookies.service';
import {SwalConfig} from '../../../assets/SwalConfig/Swal.config';
import {DatePipe, Location} from '@angular/common';
import {FlightModel} from '../../models/amadeus/flight.model';
import {TravelerTypeEnum} from '../../models/TravelerType.enum';
import {TravelerModel} from '../../models/amadeus/Traveler.model';
import {AirportModel} from '../../models/airport.model';
import {CountryJson} from '../../../assets/Country.json';


@Component({
  selector: 'app-flight-ticket-details',
  templateUrl: './flight-ticket-details.component.html',
  styleUrls: ['./flight-ticket-details.component.css']
})
export class FlightTicketDetailsComponent implements OnInit, OnDestroy {

  public fare: any;
  public error: any = null;
  public innerWidth = window.innerWidth;
  public isLoggedIn = false;
  public client: ClientModel = new ClientModel();
  public loading = true;
  public paymentType = 'paypal';
  public from: string;
  public to: string;
  public ticket: FlightModel;
  public listEnumTravelers = new Array<string>();
  public listTravelersInfo = new Array<TravelerModel>();
  public countries = new Array<AirportModel>();
  public showPayment = false;
  public mapError = new Map<number, Set<string>>();
  public principalBoxChecked = false;
  private countriesJson = new CountryJson();
  private travelerEnum = TravelerTypeEnum;
  private airports = new AirportsJson();

  constructor(private router: Router,
              private ticketService: FlightSearchingService,
              private sanitizer: DomSanitizer,
              public dialog: MatDialog,
              private errorHandler: GlobalErrorHandlerService,
              private cookie: CookiesService,
              private authService: AuthService,
              private location: Location,
              private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.ticket = JSON.parse(localStorage.getItem('ticket'));
    if (this.ticket === null || this.ticket === undefined) {
      new SwalConfig().ErrorSwalWithReturn('Erreure', 'Une erreur s\'est produite lors de la récupération de votre ticket.' +
        ' Nous nous excusons de la gêne occasionnée et vous invitons à réessayer s\'il vous plait...')
        .then(res => {
          if (res.value) {
            this.router.navigate(['search', 'flights']);
          }
        });
    }
    this.setListOfCountries();
    this.from = this.airports.airport.find(x => x.iata === this.ticket.itineraries[0].segments[0].departure.iataCode).state;
    this.to = this.airports.airport.find(x => x.iata === this.ticket.itineraries[this.ticket.itineraries.length - 1]
      .segments[this.ticket.itineraries[this.ticket.itineraries.length - 1].segments.length - 1].arrival.iataCode).state;
    this.getTravelers();
    setTimeout(() => this.loading = false, 1500);
  }

  ngOnDestroy() {
  }

  public getDescription() {
    const date = this.datePipe.transform(this.ticket.itineraries[0].segments[0].departure.at, 'dd MMM, YYYY', 'GMT');
    return `Your trip on ${date} from ${this.from.charAt(0).toUpperCase() +
    this.from.slice(1)} to ${this.to.charAt(0).toUpperCase() + this.to.slice(1)}`;
  }

  public parseDate(dateString: string) {
    return this.datePipe.transform(new Date(dateString), 'yyyy-MM-dd');
  }

  setBirthCountry(code: string, index: number) {
    this.listTravelersInfo[index].documents.birthCountry = code;
    const x = this.countriesJson.countries.find(country => country.code === code);
    this.listTravelersInfo[index].documents.birthPlace = x !== null && x !== undefined ? x.name : ''
  }

  public checkNonPrincipalTravelers() {
    if (this.listTravelersInfo.length <= 1) {
      this.showPayment = true;
      $('#condition-checkbox').prop('checked', true);
    } else {
      for (let i = 1; i < this.listTravelersInfo.length; i++) {
        const x = this.listTravelersInfo[i];
        this.updateMapError(i, `firstName${i}`, x.name.firstName.length === 0);
        this.updateMapError(i, `lastName${i}`, x.name.lastName.length === 0);
        this.updateMapError(i, `gender${i}`, x.gender.length === 0);
        this.updateMapError(i, `birthDate${i}`, x.dateOfBirth.length === 0);
        this.updateMapError(i, `birthPlace${i}`, x.documents.birthCountry.length === 0);
        if (i === this.listTravelersInfo.length - 1) {
          if (this.mapError.get(i).size === 0) {
            this.showPayment = true;
            $('#condition-checkbox').prop('checked', true);
          } else {
            this.showPayment = false;
            $('#condition-checkbox').prop('checked', false);
            let message = 'Veuillez corriger les champs en rouge des voyageurs ';
            for (const el of this.mapError.keys()) {
              if (this.mapError.get(el).size > 0) {
                message = message.concat((el + 1).toString(10) + ', ');
              }
            }
            new SwalConfig().ErrorSwalWithNoReturn('Erreur',
              message.trim().endsWith(',') ? message.slice(0, message.length - 2).trim() + ' SVP' : message.trim() + ' SVP.');
          }
        }
      }
    }
  }

  setPrincipalStatus($event: boolean) {
    this.principalBoxChecked = $event;
  }

  private updateMapError(index: number, field: string, add: boolean) {
    const arr = this.mapError.get(index);
    add ? arr.add(field) : arr.delete(field);
    this.mapError.delete(index);
    this.mapError.set(index, arr);
  }

  private getTravelers() {
    let i = 1;
    this.ticket.travelerPricings.forEach(x => {
      if (x !== this.ticket.travelerPricings[0]) {
        this.listEnumTravelers.push(this.travelerEnum[x.travelerType]);
      }
      const traveler = new TravelerModel();
      traveler.gender = '';
      traveler.documents.documentType = '';
      this.listTravelersInfo.push(traveler);
      this.mapError.set(i, new Set<string>());
      ++i;
    });
  }

  private setListOfCountries() {
    this.airports.airport.forEach(x => {
      if (this.countries.findIndex(t => t.countryCode === x.countryCode) < 0) {
        this.countries.push(x);
      }
    });
    this.countries.sort((a, b) => {
      return a.countryName > b.countryName ? 1 : a.countryName < a.countryName ? -1 : 0;
    });
  }
}
