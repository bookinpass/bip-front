import {Component, OnDestroy, OnInit} from '@angular/core';
import {AirportModel} from '../../models/airport.model';
import {AirportsJson} from '../../../assets/airports.json';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {DatePipe} from '@angular/common';
import {FlightSearchModel} from '../../models/flight-search.model';
import {SwalConfig} from '../../../assets/SwalConfig/Swal.config';
import {addDays, isBefore, parseISO} from 'date-fns';
import * as Fuse from 'fuse.js/dist/fuse';

const fuseOptions: Fuse.IFuseOptions<AirportModel> = {
  shouldSort: true,
  threshold: 0.1,
  location: 0,
  distance: 100,
  // maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    'iata',
    'city',
    'state',
    'airportName',
    'countryName',
    'airportName'
  ]
};

@Component({
  selector: 'app-flights',
  templateUrl: './flights.component.html',
  styleUrls: ['./flights.component.css']
})
export class FlightsComponent implements OnInit, OnDestroy {

  public listOfAirports: AirportModel[] = new AirportsJson().airport; // getting airport from json file in assets folder
  public fuseKeySearchDepart: string;
  public fuseKeySearchReturn: string;
  public fuseResultList = Array<AirportModel>();
  public fuseOnDepart: boolean;
  public ticketSearch = new FlightSearchModel();
  // directFlight checkBox
  public loading = false;
  public fuse = new Fuse(this.listOfAirports, fuseOptions);

  // Class for Sweet Alert default config
  private swal: SwalConfig = new SwalConfig();


  constructor(private router: Router,
              private http: HttpClient,
              private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.ticketSearch.oneWay = false;
    this.ticketSearch.nonStop = false;
    document.getElementById('fuse__block').style.width = document.getElementById('field__ref').offsetWidth + 'px';
  }

  ngOnDestroy() {
  }

  public searchFlight() {
    if (this.areAirportsValidAndDifferent() && this.areDatesValid()) {
      localStorage.setItem('search_ticket', JSON.stringify(this.ticketSearch));
      // @ts-ignore
      this.router.navigate(['/search/flights']);
    }
  }

  public selectPassenger() {
    if (this.ticketSearch.adults < this.ticketSearch.infants) {
      this.swal.ErrorSwalWithReturn('Erreur', 'Le nombre de bébé ne doit pas etre supérieur au nombre d\'adulte par voyage')
        .then(data => {
          if (data.value) {
            this.ticketSearch.infants = this.ticketSearch.adults;
          }
        });
    }
  }

  public fuseSearch(isDepart: boolean) {
    const x = document.getElementById('fuse__block');
    x.style.left = isDepart ? '0' : 'unset';
    x.style.right = isDepart ? 'unset' : '0';
    if ((isDepart && this.fuseKeySearchDepart && this.fuseKeySearchDepart.length > 1) ||
      (!isDepart && this.fuseKeySearchReturn && this.fuseKeySearchReturn.length > 1)) {
      x.style.display = 'block';
      this.fuseOnDepart = isDepart;
      this.fuseResultList.splice(0);
      this.fuse.search(isDepart ? this.fuseKeySearchDepart : this.fuseKeySearchReturn).forEach(airport => {
        // @ts-ignore
        this.fuseResultList.push(airport);
      });
    } else {
      this.closeSuggestion();
    }
  }

  public closeSuggestion() {
    this.fuseOnDepart = null;
    document.getElementById('fuse__block').style.display = 'none';
  }

  public updateSelection(item: AirportModel) {
    if (item === null) {
      setTimeout(() => this.closeSuggestion(), 250);
    } else {
      if (this.fuseOnDepart) {
        this.ticketSearch.fromIata = item.iata;
        this.fuseKeySearchDepart = item.airportName;
      } else {
        this.ticketSearch.toIata = item.iata;
        this.fuseKeySearchReturn = item.airportName;
      }
      this.closeSuggestion();
    }
  }

  private areAirportsValidAndDifferent(): boolean {
    if (this.listOfAirports.filter(x => x.iata.equalIgnoreCase(this.ticketSearch.fromIata)).length === 0 ||
      this.listOfAirports.filter(x => x.iata.equalIgnoreCase(this.ticketSearch.toIata)).length === 0) {
      const local = this.listOfAirports.filter(x => x.iata.equalIgnoreCase(this.ticketSearch.fromIata)).length === 0 ? 'de départ' : 'd\'arrivée';
      this.swal.ErrorSwalWithNoReturn('Erreur', `Veuillez séléctionner un lieu ${local} valide.`);
      return false;
    }
    if (this.ticketSearch.fromIata !== '' && this.ticketSearch.toIata !== '' &&
      this.ticketSearch.fromIata.equalIgnoreCase(this.ticketSearch.toIata)) {
      this.swal.ErrorSwalWithNoReturn('Erreur', `les aéroports d'origine et de destination ne peuvent pas être les mêmes!`);
      return false;
    }
    return true;
  }

  private areDatesValid() {
    let x = true;
    let msg = '';
    const todayFormatted = this.datePipe.transform(new Date(), 'dd MMMM yyyy', 'UTC');
    if (this.ticketSearch.departure === null || this.ticketSearch.departure === undefined) {
      msg = 'Veuillez sélectionner une date de départ';
    } else if (isBefore(parseISO(this.ticketSearch.departure.toString()), new Date())) {
      msg = 'La date de départ doit être supérieur au ' + todayFormatted;
    } else if (!this.ticketSearch.oneWay) {
      if (this.ticketSearch.return === null || this.ticketSearch.return === undefined) {
        msg = 'Veuillez sélectionner une date de retour';
      } else if (isBefore(parseISO(this.ticketSearch.return.toString()), addDays(parseISO(this.ticketSearch.departure.toString()), 1))) {
        msg = 'La date de retour ne peut être inférieure ou égale à la date de départ';
      }
    }
    if (msg.length > 0) {
      this.swal.ErrorSwalWithNoReturn('Erreur', msg);
      x = false;
    }
    return x;
  }
}
