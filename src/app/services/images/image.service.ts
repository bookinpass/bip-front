import {Injectable} from '@angular/core';
import {UrlConfig} from '../../../assets/url.config';
import {HttpClient, HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private urlRepository = new UrlConfig();
  readonly host = this.urlRepository.host;
  readonly imageUrl = this.urlRepository.imageUrl;

  constructor(private http: HttpClient) {
  }

  getImage(directory: string, filename: string) {
    const params = new HttpParams({
      fromObject: {
        directory,
        filename
      }
    });
    return this.http.get(`${this.host + this.imageUrl}`, {params, observe: 'response', responseType: 'json'});
  }

}
