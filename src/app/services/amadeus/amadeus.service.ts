import {Injectable} from '@angular/core';
import {UrlConfig} from '../../../assets/url.config';
import {HttpClient, HttpParams} from '@angular/common/http';
import {FlightModel} from '../../models/amadeus/flight.model';
import {FlightSearchModel} from '../../models/flight-search.model';
import {DatePipe} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AmadeusService {

  private urlConfig = new UrlConfig();
  private host = this.urlConfig.bookingHost;
  private search = this.urlConfig.searchFlights;

  constructor(private http: HttpClient,
              private datePipe: DatePipe) {
  }

  private static isNullOrUndef(t: any) {
    return t === null || t === undefined;
  }

  public searchFlight(ticket: FlightSearchModel) {
    const param = new HttpParams({
      fromObject: {
        from: ticket.fromIata.toUpperCase(),
        to: ticket.toIata.toUpperCase(),
        departDate: this.formatDateToString(ticket.departure),
        nonStop: String(ticket.nonStop),
        adults: ticket.adults.toString(10),
        children: String(AmadeusService.isNullOrUndef(ticket.children) ? 0 : ticket.children),
        infants: String(AmadeusService.isNullOrUndef(ticket.infants) ? 0 : ticket.infants),
        travelClass: AmadeusService.isNullOrUndef(ticket.travelClass) ? '' : ticket.travelClass.toUpperCase(),
        max: String(ticket.max),
        currencyCode: ticket.currencyCode.toUpperCase(),
        returnDate: !AmadeusService.isNullOrUndef(ticket.return) ? this.formatDateToString(ticket.return) : '',
        excludedAirlineCodes: !AmadeusService.isNullOrUndef(ticket.excludedAirlineCodes) ? ticket.excludedAirlineCodes : '',
        includedAirlineCodes: !AmadeusService.isNullOrUndef(ticket.includedAirlineCodes) ? ticket.includedAirlineCodes : ''
      }
    });
    return this.http.get<Array<FlightModel>>(this.host + this.search, {params: param});
  }

  private formatDateToString(date: Date) {
    return this.datePipe.transform(date, 'yyyy-MM-dd', 'UTC', 'en-US');
  }

}
