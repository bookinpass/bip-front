import {Component, OnDestroy, OnInit} from '@angular/core';
import {AirportModel} from '../../models/airport.model';
import {AirportsJson} from '../../../assets/airports.json';
import {Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {FlightSearchModel} from '../../models/amadeus/flight-search.model';
import {SwalConfig} from '../../../assets/SwalConfig/Swal.config';
import {addDays, isBefore, parseISO} from 'date-fns';
import * as _ from 'underscore';
import Fuse from 'fuse.js';

@Component({
  selector: 'app-flights',
  templateUrl: './flights.component.html',
  styleUrls: ['./flights.component.css']
})
export class FlightsComponent implements OnInit, OnDestroy {

  public fuseKeySearchDepart: string;
  public fuseKeySearchReturn: string;
  public fuseResultList = Array<AirportModel>();
  public fuseOnDepart: boolean;
  public searchModel = {} as FlightSearchModel;
  public oneWay = false;

  // directFlight checkBox
  public loading = false;
  public fuse;
  private listOfAirports: AirportModel[] = new AirportsJson().airport; // getting airport from json file in assets folder
  // Class for Sweet Alert default config
  private swal: SwalConfig = new SwalConfig();

  private fuseOptions: Fuse.IFuseOptions<any> = {
    shouldSort: true,
    threshold: 0.1,
    location: 0,
    distance: 100,
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

  constructor(private router: Router,
              private datePipe: DatePipe) {
    this.fuse = new Fuse(this.listOfAirports, this.fuseOptions);
  }

  ngOnInit() {
    this.searchModel.nonStop = false;
    this.searchModel.adults = 1;
    this.searchModel.children = 0;
    this.searchModel.infants = 0;
    this.searchModel.travelClass = 'ECONOMY';
    this.searchModel.currencyCode = 'XOF';
    this.searchModel.from = null;
    this.searchModel.to = null;
    this.searchModel.max = 100;
    document.getElementById('fuse__block').style.width = document.getElementById('field__ref').offsetWidth + 'px';
  }

  ngOnDestroy() {
  }

  public searchFlight() {
    if (this.fuseKeySearchDepart !== undefined && this.fuseKeySearchDepart !== null && this.fuseKeySearchDepart.length > 0)
      this.searchModel.from = _.find(this.listOfAirports, x => x.airportName === this.fuseKeySearchDepart)?.iata || null;
    else this.searchModel.from = null;

    if (this.fuseKeySearchReturn !== undefined && this.fuseKeySearchReturn !== null && this.fuseKeySearchReturn.length > 0)
      this.searchModel.to = _.find(this.listOfAirports, x => x.airportName === this.fuseKeySearchReturn)?.iata || null;
    else this.searchModel.to = null;

    if (this.oneWay) this.searchModel.returnDate = null;
    if (this.areAirportsValidAndDifferent() && this.areDatesValid()) {
      sessionStorage.setItem('search-data', JSON.stringify(this.searchModel));
      this.router.navigate(['flights']).then();
    }
  }

  public fuseSearch(isDepart: boolean) {
    const x = document.getElementById('fuse__block');
    x.style.left = isDepart ? '0' : 'unset';
    x.style.right = isDepart ? 'unset' : '0';
    const data = isDepart ? this.fuseKeySearchDepart : this.fuseKeySearchReturn;
    if (data?.length > 1) {
      x.style.display = 'block';
      this.fuseOnDepart = isDepart;
      this.fuseResultList = this.fuse.search(data).map(item => item.item);
    } else this.closeSuggestion();
  }

  public closeSuggestion() {
    this.fuseOnDepart = null;
    document.getElementById('fuse__block').style.display = 'none';
  }

  public updateSelection(item: AirportModel) {
    if (item === null) {
      setTimeout(() => {
        this.closeSuggestion();
      }, 200);
    } else {
      if (this.fuseOnDepart) {
        this.fuseKeySearchDepart = item.airportName;
      } else {
        this.fuseKeySearchReturn = item.airportName;
      }
      this.closeSuggestion();
    }
  }

  private areAirportsValidAndDifferent(): boolean {
    if (this.searchModel.from === null || this.searchModel.to === null) {
      const local = this.searchModel.from === null ? 'de départ' : 'd\'arrivée';
      this.swal.ErrorSwalWithNoReturn('Erreur', `Veuillez séléctionner un lieu ${local} valide.`);
      return false;
    }
    if (this.searchModel.from.equalIgnoreCase(this.searchModel.to)) {
      this.swal.ErrorSwalWithNoReturn('Erreur', `les aéroports d'origine et de destination ne peuvent pas être les mêmes!`);
      return false;
    }
    return true;
  }

  private areDatesValid() {
    let x = true;
    let msg = '';
    const todayFormatted = this.datePipe.transform(new Date(), 'dd MMMM yyyy', 'UTC');
    if (this.searchModel.departDate === null || this.searchModel.departDate === undefined) {
      msg = 'Veuillez sélectionner une date de départ';
    } else if (isBefore(parseISO(this.searchModel.departDate.toString()), new Date())) {
      msg = 'La date de départ doit être supérieur au ' + todayFormatted;
    } else if (!this.oneWay) {
      if (this.searchModel.returnDate === null || this.searchModel.returnDate === undefined) {
        msg = 'Veuillez sélectionner une date de retour';
      } else if (isBefore(parseISO(this.searchModel.returnDate.toString()), addDays(parseISO(this.searchModel.departDate.toString()), 1))) {
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
