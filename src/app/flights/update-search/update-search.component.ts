import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {AirportsJson} from '../../../assets/airports.json';
import {LocationValue} from '../../models/amadeus/dictionaryModel';
import {DatePipe, TitleCasePipe} from '@angular/common';
import Swal from 'sweetalert2';
import {AirportModel} from '../../models/airport.model';
import Fuse from 'fuse.js';
import {addDays, isAfter, isBefore, isSameDay, isValid, parseISO} from 'date-fns';
import {IDatePickerConfig} from 'ng2-date-picker';
import * as moment from 'moment';
import {Moment} from 'moment';

@Component({
  selector: 'app-update-search',
  templateUrl: './update-search.component.html',
  styleUrls: ['./update-search.component.css']
})
export class UpdateSearchComponent implements OnInit, OnChanges {

  @Output() updateResearch = new EventEmitter<Map<string, string>>();

  @Input() from: string;
  @Input() to: string;
  @Input() departDate: Date;
  @Input() returnDate: Date;
  @Input() travelerAdults: number;
  @Input() travelerChildren: number;
  @Input() travelerInfants: number;
  @Input() travelClass: string;
  @Input() locations: { [key: string]: LocationValue };

  public isEditing = false;
  public departure: string;
  public arrival: string;
  public dateDeparture: Moment;
  public dateArrival: Moment;
  public adults: number;
  public children: number;
  public infants: number;
  public oneWay: boolean;
  public fare: string;

  public datePickerConfig = {} as IDatePickerConfig;
  public fuseKeySearchDepart: string;
  public fuseKeySearchReturn: string;
  public fuseResultList = Array<AirportModel>();
  public fuseOnDepart: boolean;
  public fuse;
  private airports = new AirportsJson().airport;
  private listOfAirports: AirportModel[] = new AirportsJson().airport;

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

  constructor(private titleCasePipe: TitleCasePipe,
              private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.configDP();
    this.fuse = new Fuse(this.listOfAirports, this.fuseOptions);
    this.refreshData();
  }

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    this.refreshData();
  }

  public fuseSearch = (isDepart: boolean): void => {
    const data = isDepart ? this.fuseKeySearchDepart : this.fuseKeySearchReturn;
    if (data?.length > 1) {
      document.getElementById('fuse__block').style.display = 'block';
      this.fuseOnDepart = isDepart;
      this.fuseResultList = this.fuse.search(data).map(item => item.item);
    } else this.closeSuggestion();
  }

  public updateSelection = (item: AirportModel): void => {
    if (item === null) {
      if (!this.fuseKeySearchDepart.includes('(') && !this.fuseKeySearchDepart.endsWith(')'))
        this.fuseKeySearchDepart = this.getCity(this.from);
      else if (!this.fuseKeySearchReturn.includes('(') && !this.fuseKeySearchReturn.endsWith(')'))
        this.fuseKeySearchReturn = this.getCity(this.to);
      setTimeout(() => this.closeSuggestion(), 200);
    } else {
      if (this.fuseOnDepart) {
        this.fuseKeySearchDepart = this.getCity(item.iata);
        this.departure = item.iata;
      } else {
        this.fuseKeySearchReturn = this.getCity(item.iata);
        this.arrival = item.iata;
      }
      this.closeSuggestion();
    }
  }

  public getCity = (iata: string) => {
    let city = this.airports.find(x => x.iata.equalIgnoreCase(iata))?.city;
    if (city === null) city = this.locations[iata].cityCode;
    return this.titleCasePipe.transform(city) + ` (${iata.toUpperCase()})`;
  }

  public cancel = (): void => {
    this.refreshData();
    this.isEditing = false;
  }

  public edit = (): void => {
    this.isEditing = true;
    this.refreshData();
    setTimeout(() => {
      const doc = document.getElementById('passenger-update-content');
      const dropdown = document.getElementById('passenger-update-input')
      dropdown.onclick = () => doc.style.display = 'flex';
      $(document).on('click', (e) => {
        if ((!doc.contains(e.target) && !dropdown.contains(e.target)) && doc.style.display !== 'none') doc.style.display = 'none';
      });
    }, 200);
  }

  public maxPassenger = (): boolean => {
    return this.adults + this.infants + this.children === 9;
  }

  public getPassengers = (): string => {
    let msg = `${this.adults} adulte${this.adults > 1 ? 's' : ''} `;
    if (this.children > 0) msg += `& ${this.children} enfant${this.children > 1 ? 's' : ''} `;
    if (this.infants > 0) msg += `& ${this.infants} bébé${this.infants > 1 ? 's' : ''}`;
    return msg;
  }

  public updatePassengerNumber = (item: number, b: boolean): void => {
    switch (item) {
      case 1:
        this.adults = b ? ++this.adults : --this.adults;
        break;
      case 2:
        this.children = b ? ++this.children : --this.children;
        break;
      case 3:
        this.infants = b ? ++this.infants : --this.infants;
        break;
    }
  }

  public updateSearch = () => {
    const depart = this.datePipe.transform(this.dateDeparture, 'yyyy-MM-ddTHH:mm:ss', 'UTC', 'en-EN');
    let arrival = null;
    if (!this.oneWay) arrival = this.datePipe.transform(this.dateArrival, 'yyyy-MM-ddTHH:mm:ss', 'UTC', 'en-EN');
    const map = new Map<string, string>();
    map.set('from', this.departure);
    map.set('to', this.arrival);
    map.set('depart', depart);
    map.set('return', arrival);
    map.set('adults', this.adults.toString(10));
    map.set('children', this.children.toString(10));
    map.set('infants', this.infants.toString(10));
    map.set('class', this.fare);
    this.checkDates(map, depart, arrival);
  }

  public arrivalDateChange(date: moment.Moment) {
    if (date) {
      if (isAfter(this.dateDeparture.toDate(), date.toDate()) || isSameDay(this.dateDeparture.toDate(), date.toDate()))
        Swal.fire({
          title: 'Erreur', text: 'La date de retour doit etre superieur a la date de depart', icon: 'error', timer: 3000,
          timerProgressBar: true, showConfirmButton: false
        }).then(x => {
          if (x) this.dateArrival = null;
        })
      else this.dateArrival = date;
    }
  }

  private checkDates = (map: Map<string, string>, depart: string, arrival: string) => {
    if (depart === null || depart === undefined || depart.length <= 0 || !isValid(parseISO(depart)))
      this.throwError('Veuillez sélectionner une date de départ!').then();
    else if (isBefore(parseISO(depart), new Date()))
      this.throwError('La date de départ doit être supérieur à la date du jour!').then();
    else if (!this.oneWay && (arrival === null || arrival === undefined || !isValid(parseISO(arrival))))
      this.throwError('Veuillez sélectionner une date de retour!').then();
    else if (!this.oneWay && isBefore(parseISO(arrival), addDays(parseISO(depart), 2)))
      this.throwError('La date d\'arrivée doit être au moins 2 jours après le départ!').then();
    else {
      this.updateResearch.emit(map);
      this.cancel();
    }
  }

  private closeSuggestion = (): void => {
    this.fuseOnDepart = null;
    document.getElementById('fuse__block').style.display = 'none';
  }

  private refreshData(): void {
    this.departure = this.from;
    this.arrival = this.to;
    this.dateDeparture = moment(this.departDate);
    this.dateArrival = this.oneWay ? null : moment(this.returnDate);
    this.adults = this.travelerAdults;
    this.children = this.travelerChildren;
    this.infants = this.travelerInfants;
    this.fare = this.travelClass;
    this.oneWay = this.returnDate === null || this.returnDate === undefined;
    this.fuseKeySearchDepart = this.getCity(this.departure);
    this.fuseKeySearchReturn = this.getCity(this.arrival);
  }

  private throwError = (msg: string) => {
    return Swal.fire({
      title: 'Erreur', html: msg, icon: 'error', showConfirmButton: false, timer: 2500, timerProgressBar: true
    });
  }

  private configDP() {
    this.datePickerConfig.locale = 'fr';
    this.datePickerConfig.format = 'DD MMM YYYY';
    this.datePickerConfig.firstDayOfWeek = 'mo';
    this.datePickerConfig.monthFormat = 'MMMM YYYY';
    this.datePickerConfig.allowMultiSelect = false;
    this.datePickerConfig.weekDayFormat = 'dd';
    this.datePickerConfig.drops = 'down';
    this.datePickerConfig.opens = 'right';
    this.datePickerConfig.showGoToCurrent = false;
    this.datePickerConfig.showMultipleYearsNavigation = true;
    this.datePickerConfig.disableKeypress = true;
    this.datePickerConfig.min = moment.utc();
  }
}
