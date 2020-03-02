import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AirportModel} from '../../models/airport.model';
import {UrlConfig} from "../../../assets/url.config";

@Injectable({
  providedIn: 'root'
})
export class AirportService {

  readonly config: UrlConfig = new UrlConfig();

  constructor(private http: HttpClient) {
  }

  public getAirports() {
    return this.http.get<AirportModel[]>(this.config.host + this.config.airportUrl);
  }
}
