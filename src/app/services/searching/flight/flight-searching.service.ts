import {Injectable} from '@angular/core';
import {UrlConfig} from "../../../../assets/url.config";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {VolTicketTypeModel} from "../../../models/vol-ticket-type.model";

@Injectable({
  providedIn: 'root'
})
export class FlightSearchingService {

  private urlRepository = new UrlConfig();
  private host = this.urlRepository.host;

  private readonly httpHeaders: HttpHeaders = new HttpHeaders({
    'content-type': 'application/json'
  });

  constructor(private http: HttpClient) {
  }

  public getDirectFlights(from: string, to: string, date: string, fare: string, seat?: number) {
    const param: HttpParams = new HttpParams()
        .set('from', from)
        .set('to', to)
        .set('date', date)
        .set('fare', fare)
        .set('seat', this.formatSeat(seat));
    return this.http.get<VolTicketTypeModel[]>(this.host + this.urlRepository.directFlightTicketUrl, {
      headers: this.httpHeaders,
      params: param
    });
  }

  public getNonDirectFlights(from: string, to: string, date: string, fare: string, seat?: number) {
    const param: HttpParams = new HttpParams()
        .set('from', from)
        .set('to', to)
        .set('date', date)
        .set('fare', fare)
        .set('seat', this.formatSeat(seat));
    return this.http.get<Array<VolTicketTypeModel[]>>(this.host + this.urlRepository.oneStopoverTicketUrl, {
      headers: this.httpHeaders,
      params: param
    });
  }

  // return a flight ticket from a code
  public getTicketsByFlightCode(code: string) {
    return this.http.get<VolTicketTypeModel>(this.host + this.urlRepository.searchTicketsByCode + `/${code}`,
        {headers: this.httpHeaders});
  }

  private formatSeat = function (seat: number) {
    return seat === null || seat === undefined || typeof seat !== 'number' ? '1' : seat.toString(10);
  };

}
