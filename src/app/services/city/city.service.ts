import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CityModel} from '../../models/city.model';
import {UrlConfig} from "../../../assets/url.config";

@Injectable({
  providedIn: 'root'
})
export class CityService {

 private urlRepository = new UrlConfig();

  constructor(private http: HttpClient) {
  }

  // getCities() {
  //   return this.http.get<CityModel[]>(this.config.host + this.config.cityUrl);
  // }
}
