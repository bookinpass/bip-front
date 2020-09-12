import {Component, OnDestroy, OnInit} from '@angular/core';
import {FlightSearchModel} from '../../models/amadeus/flight-search.model';
import {AmadeusService} from '../../services/amadeus/amadeus.service';
import {DatePipe, TitleCasePipe} from '@angular/common';
import {Scavenger} from '@wishtack/rx-scavenger';
import {retry} from 'rxjs/operators';
import {FlightOfferResponseModel} from '../../models/amadeus/flight-offer-response.model';
import {Router} from '@angular/router';
import * as _ from 'underscore';
import {AirportsJson} from '../../../assets/airports.json';
import {FlightOfferModel} from '../../models/amadeus/flight-offer.model';
import Swal from 'sweetalert2';
import {DictionaryModel} from '../../models/amadeus/dictionaryModel';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {

  public updatingSearch = false;
  public loading = true;
  public loadingFilter = false;
  public priceRange: { min: number, max: number };

  public totalElements: number;
  public currentPage = 0;
  public elementPerPage: number[] = [15, 25, 50, 100];
  public itemPerPage = this.elementPerPage[0];
  public collection: FlightOfferModel[] = [];
  public searchModel: FlightSearchModel;
  public dictionaryModel: DictionaryModel;

  private result: FlightOfferResponseModel;
  private airports = new AirportsJson();
  private scavenger = new Scavenger(this);

  constructor(private amadeusService: AmadeusService,
              private datePipe: DatePipe,
              private titleCasePipe: TitleCasePipe,
              private router: Router) {
  }

  async ngOnInit() {
    await this.amadeusService.setToken();
    this.searchModel = JSON.parse(sessionStorage.getItem('search-data')) as FlightSearchModel;
    if (this.searchModel === null || this.searchModel === undefined) {
      await this.router.navigate(['/']);
    }
    this.searchFlights();
  }

  ngOnDestroy() {
    this.scavenger.unsubscribe();
  }

  public getStops = (length: number) => {
    return length === 0 ? 'Sans escale' : length === 1 ? '1 escale' : `${length} escales`;
  }

  public formatItineraryDuration = (duration: string) => {
    const v = _.map(duration.split('H'), value => value.replace(/\D/g, ''));
    return `${v[0]} h ${v.length === 1 ? '00' : v[1]}`;
  }

  public formatDateTime = (dateTime: string) => {
    return this.datePipe.transform(dateTime, 'HH:mm', 'UTC', 'fr-FR');
  }

  public getCityFromDictionary = (iata: string) => {
    let city = this.airports.airport.find(x => x.iata.equalIgnoreCase(iata))?.city;
    if (city === null) {
      city = this.result.dictionaries.locations[iata].cityCode;
    }
    return this.titleCasePipe.transform(city) + ` (${iata.toUpperCase()})`;
  }

  public getAirline = (str: string) => {
    return this.titleCasePipe.transform(this.result.dictionaries.carriers[str]);
  }

  public doPagination(page: number) {
    this.currentPage = page;
    window.scroll(0, 70);
  }

  public filterPrice(map: Map<string, number>) {
    this.isFiltering(true);
    this.collection = this.result.data;
    if (map.has('min')) {
      this.collection = this.collection.filter(x => Number(x.price.grandTotal) >= Number(map.get('min')));
    }
    if (map.has('max')) {
      this.collection = this.collection.filter(x => Number(x.price.grandTotal) <= Number(map.get('max')));
    }
    this.totalElements = this.collection.length;
    setTimeout(() => this.isFiltering(), 2000);
  }

  public filterAirlines(airlines: string) {
    this.isFiltering(true);
    this.searchModel.includedAirlineCodes = airlines;
    this.searchFlights(true);
  }

  public filterStops(stop: boolean) {
    this.isFiltering(true);
    this.searchModel.nonStop = stop;
    this.searchFlights(true);
  }

  public doUpdate = (map: Map<string, string>) => {
    this.searchModel.from = map.get('from').toUpperCase();
    this.searchModel.to = map.get('to').toUpperCase();
    this.searchModel.departDate = new Date(map.get('depart'));
    this.searchModel.returnDate = map.get('return') === null ? null : new Date(map.get('return'));
    this.searchModel.travelClass = map.get('class').toUpperCase();
    this.searchModel.adults = Number(map.get('adults'));
    this.searchModel.children = Number(map.get('children'));
    this.searchModel.infants = Number(map.get('infants'));
    sessionStorage.setItem('search-data', JSON.stringify(this.searchModel));
    this.updatingSearch = true;
    this.searchFlights();
  }

  public selectTicket = (item: FlightOfferModel) => {
    sessionStorage.setItem('offer', JSON.stringify(item));
    this.router.navigate(['flights', 'details']).then();
  }

  private fixNGXClass = () => {
    const x = $('.ngx-pagination');
    if (x !== null && x.length > 0) {
      const y = x[0];
      y.style.display = 'flex';
      y.style.justifyContent = 'center';
      y.style.alignItems = 'center';
      y.style.fontSize = '16px';
    }
  }

  private searchFlights(filter = false) {
    const departDate = this.datePipe.transform(this.searchModel.departDate, 'yyyy-MM-dd', 'UTC');
    const returnDate = this.datePipe.transform(this.searchModel.returnDate, 'yyyy-MM-dd', 'UTC');

    this.amadeusService.getFlights(this.searchModel.from, this.searchModel.to, departDate, this.searchModel.travelClass,
      this.searchModel.nonStop ? 'true' : 'false', this.searchModel.adults, this.searchModel.children, this.searchModel.infants,
      this.searchModel.max, this.searchModel.currencyCode, returnDate, this.searchModel.includedAirlineCodes)
      .pipe(this.scavenger.collect(), retry(2))
      .subscribe(data => {
          if (data.data.length === 0) {
            this.swalError('Votre recherche n\'a pas donné de résultat. Veuillez essayer avec différents critères.');
          } else {
            this.result = data;
            this.collection = data.data;
            this.totalElements = data.meta.count;
            if (!filter) {
              this.dictionaryModel = data.dictionaries;
            }
            this.setRangePrice();
          }
        }, () => this.swalError('Une erreur s\'est produite lors de la recherche. Veuillez réessayer SVP!'),
        () => {
          if (!filter) {
            if (this.updatingSearch) {
              this.updatingSearch = false;
            } else {
              this.loading = false;
            }
          } else {
            this.isFiltering();
          }
          setTimeout(() => this.fixNGXClass(), 250);
        });
  }

  private swalError = (msg: string) => {
    Swal.fire({
      title: 'Ooops!!!',
      html: msg,
      icon: 'error', allowEnterKey: true, allowEscapeKey: false, allowOutsideClick: false, focusConfirm: true
    }).then(res => {
      if (res.value) {
        sessionStorage.removeItem('search-data');
        this.router.navigate(['/']).then();
      }
    });
  }

  private setRangePrice() {
    const x = _.map(this.collection, item => Number(item.price.grandTotal)).sort();
    this.priceRange = {min: _.min(x), max: _.max(x)};
  }

  private isFiltering(bool = false) {
    const ele = $('.main-content')[0];
    if (bool) {
      this.loadingFilter = true;
      const reduced = $('.page-footer')[0].clientHeight + 70;
      ele.style.height = `calc(100vh - ${reduced}px)`;
      ele.style.overflow = `hidden`;
    } else {
      this.loadingFilter = false;
      ele.style.height = 'auto';
      ele.style.overflow = 'auto';
    }
  }
}
