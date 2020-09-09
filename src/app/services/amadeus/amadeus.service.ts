import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {addSeconds, isAfter} from 'date-fns';
import {retry} from 'rxjs/operators';
import {Scavenger} from '@wishtack/rx-scavenger';
import {FlightOfferResponseModel} from '../../models/amadeus/flight-offer-response.model';
import {UrlConfig} from '../../../assets/url.config';
import {FlightCreateOrderResponseModel} from '../../models/amadeus/flight-create-order-response.model';
import {FlightOfferPricingResponseModel} from '../../models/amadeus/flight-offer-pricing-response.model';

@Injectable({
  providedIn: 'root'
})
export class AmadeusService implements OnDestroy {

  // todo: handle subscriptions
  private url = new UrlConfig();
  private scavenger = new Scavenger(this);

  constructor(private http: HttpClient) {
  }

  ngOnDestroy() {
    this.scavenger.unsubscribe();
  }

  public getFlights(from: string, to: string, departureDate: string, travelClass: string, nonStop: string, adult: number, children = 0,
                    infants = 0, max = 100, currencyCode = 'XOF', returnDate?: string, includedAirlineCodes?: string) {
    let httpParam = new HttpParams({
      fromObject: {
        originLocationCode: from.toUpperCase(),
        destinationLocationCode: to.toUpperCase(),
        departureDate,
        nonStop,
        currencyCode: currencyCode.toUpperCase(),
        adults: adult.toString(10),
        children: children.toString(10),
        infants: infants.toString(10),
        travelClass: travelClass.toUpperCase(),
        max: max.toString(10)
      }
    });
    if (returnDate && returnDate.length > 0) httpParam = httpParam.append('returnDate', returnDate);
    if (includedAirlineCodes && includedAirlineCodes.length > 0)
      httpParam = httpParam.append('includedAirlineCodes', includedAirlineCodes.toUpperCase());
    return this.http.get<FlightOfferResponseModel>(this.url.flightOfferSearch, {params: httpParam});
  }

  public getFlightPricing(data: string) {
    const params = new HttpParams({
      fromObject: {
        include: 'credit-card-fees,bags,other-services,detailed-fare-rules',
        forceClass: 'true'
      }
    })
    return this.http.post<FlightOfferPricingResponseModel>(this.url.flightOfferPricing, data, {params});
  }

  public getSeatsMap(data: string) {
    return this.http.post<any>(this.url.seatsMap, data);
  }

  public createOrder(data: string) {
    return this.http.post<FlightCreateOrderResponseModel>(this.url.flightCreateOrder, data);
  }

  public getOrder(id: string) {
    return this.http.get<FlightCreateOrderResponseModel>(this.url.flightCreateOrder + '/' + id);
  }

  public deleteOrder(id: string) {
    return this.http.delete(this.url.flightCreateOrder + '/' + id);
  }

  public setToken = async () => {
    const expiry = this.isTokenExpired();
    if (expiry) {
      const data: any = await this.requestToken();
      localStorage.setItem('ama_token', data.access_token);
      localStorage.setItem('ama_expiry', data.expires_in);
      localStorage.setItem('ama_gen', new Date().toString());
    }
  }

  private isTokenExpired = (): boolean => {
    const token = localStorage.getItem('ama_token');
    if (token === null || token === undefined) return true;
    const expiry = localStorage.getItem('ama_expiry');
    const gen = new Date(localStorage.getItem('ama_gen'));
    const expiryDate = addSeconds(gen, Number(expiry));
    return isAfter(new Date(), expiryDate);
  }

  private requestToken = async () => {
    const header = new HttpHeaders().set('Content-type', 'application/x-www-form-urlencoded');
    const body = new URLSearchParams();
    // todo: set variable aside
    body.set('client_id', 'eygavHjzPPjkbMf5ywY3aFPAGnry02ZR')
    body.set('client_secret', 'kTjZePk9esJKIf2y')
    body.set('grant_type', 'client_credentials');
    body.set('hostname', 'test');
    return await this.http.post(this.url.requestAmadeusToken, body.toString(), {headers: header})
      .pipe(this.scavenger.collect(), retry(2), this.scavenger.collect()).toPromise();
  }

}
