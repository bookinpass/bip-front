import {Injectable} from '@angular/core';
import {UrlConfig} from '../../../assets/url.config';
import {CookiesService} from '../cookie/cookies.service';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SharingService {

  private url = new UrlConfig();

  constructor(private cookieService: CookiesService,
              private http: HttpClient) {
  }

  public doSharing(item: string, type: string, dialCode: string) {
    const currentUser = this.cookieService.getCookie('last_email');
    return this.http.post(`${this.url.eventHost}/tickets/${type}/sharing`, item,
      {params: {username: currentUser, dial: dialCode}, observe: 'response'});
  }
}
