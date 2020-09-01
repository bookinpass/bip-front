import {Component, Input} from '@angular/core';
import {FlightOfferModel} from '../../../models/amadeus/flight-offer.model';
import {DictionaryModel} from '../../../models/amadeus/dictionaryModel';
import {CompanyJson} from '../../../../assets/compagnies.json';
import {AirportsJson} from '../../../../assets/airports.json';
import * as _ from 'underscore.string';
import {differenceInHours, differenceInMinutes} from 'date-fns';
import {TravelerModel} from '../../../models/amadeus/traveler.model';
import {CountryFRJson} from '../../../../assets/Country-FR.json';
import {IDatePickerConfig} from 'ng2-date-picker';
import * as moment from 'moment';

@Component({
  selector: 'app-ticket-resume',
  templateUrl: './ticket-resume.component.html',
  styleUrls: ['./ticket-resume.component.css']
})
export class TicketResumeComponent {

  @Input() travelers: TravelerModel[];
  @Input() flightOffer: FlightOfferModel;
  @Input() dictionary: DictionaryModel;

  public countries = new CountryFRJson().countries;
  public datePickerConfig: IDatePickerConfig = {} as IDatePickerConfig;
  public datePickerConfig2: IDatePickerConfig = {} as IDatePickerConfig;
  private companies = new CompanyJson().companies;
  private airports = new AirportsJson().airport;

  constructor() {
    this.configDP();
    this.configDP2();
  }

  public getItineraries = () => {
    const arr = [this.flightOffer.itineraries[0]];
    if (this.flightOffer.itineraries.length > 1) arr.push(this.flightOffer.itineraries[this.flightOffer.itineraries.length - 1])
    return arr;
  }

  public getCompanyName = (iata: string) => {
    const item = this.companies.find(x => x.iata.equalIgnoreCase(iata));
    return item === null ? iata : item.designation;
  }

  public getNumberOfStops = (length: number) => {
    return `${length} escale${length === 1 ? '' : 's'}`;
  }

  public getTerminal = (terminal: string) => {
    return terminal && terminal.length > 0 ? `Terminale ${terminal.toUpperCase()}` : '';
  }

  public getCityAirport = (iataCode: string) => {
    const item = this.airports.find(x => x.iata.equalIgnoreCase(iataCode));
    if (item === null || item === undefined) return iataCode;
    return item.airportName.replace(/airport/i, '')
      .replace(/international/i, '')
      .replace(/internationale/i, '')
      .replace('  ', ' ').trim()
      .concat(`, ${_.humanize(item.city)} (${_.humanize(item.countryName)})`)
  }

  public getCity = (iataCode: string) => {
    const item = this.airports.find(x => x.iata.equalIgnoreCase(iataCode)).city;
    return item !== null && item !== undefined ? item : this.dictionary.locations[iataCode];
  }

  public getDuration = (depart: string, arrival: string) => {
    const date1 = new Date(depart);
    const date2 = new Date(arrival);
    return `${differenceInHours(date2, date1)} h ${differenceInMinutes(date2, date1) % 60} min`;
  }

  public getPassengerType = (t: string) => {
    if (t.equalIgnoreCase('adult')) return 'Adulte (+12 ans)'
    else if (['infant', 'held_infant', 'seated_infant'].includes(t.toLowerCase())) return 'Bebe (0 - 2 ans)'
    else if (t.equalIgnoreCase('child')) return 'Enfant (2 - 12 ans)'
    else if (t.equalIgnoreCase('senior')) return 'Senior (60 ans et +)'
  }

  public getIncludedBags = (segmentId: string, travelerIndex: number): string => {
    const item = this.flightOffer.travelerPricings[travelerIndex].fareDetailsBySegment
      .filter(x => x.segmentId.equalIgnoreCase(segmentId))[0].includedCheckedBags;
    return (!item.quantity ? 1 : item.quantity).toString(10)
      .concat(item.weight !== null && item.weight !== undefined ? ' * ' + item.weight + ' ' + item.weightUnit : ' * 23 KG');
  }

  private configDP = (): void => {
    this.datePickerConfig.locale = 'fr';
    this.datePickerConfig.format = 'DD MMMM YYYY';
    this.datePickerConfig.firstDayOfWeek = 'mo';
    this.datePickerConfig.monthFormat = 'MMMM YYYY';
    this.datePickerConfig.allowMultiSelect = false;
    this.datePickerConfig.weekDayFormat = 'dd';
    this.datePickerConfig.drops = 'down';
    this.datePickerConfig.opens = 'right';
    this.datePickerConfig.max = moment.utc();
    this.datePickerConfig.disableKeypress = true;
  }

  private configDP2 = (): void => {
    this.datePickerConfig2.locale = 'fr';
    this.datePickerConfig2.format = 'DD MMMM YYYY';
    this.datePickerConfig2.firstDayOfWeek = 'mo';
    this.datePickerConfig2.monthFormat = 'MMMM YYYY';
    this.datePickerConfig2.allowMultiSelect = false;
    this.datePickerConfig2.weekDayFormat = 'dd';
    this.datePickerConfig2.drops = 'down';
    this.datePickerConfig2.opens = 'right';
    this.datePickerConfig2.min = moment.utc();
    this.datePickerConfig2.disableKeypress = true;
  }
}
