import {Injectable} from '@angular/core';
import {UrlConfig} from '../../../assets/url.config';
import {CookiesService} from '../cookie/cookies.service';
import {HttpClient} from '@angular/common/http';
import {TicketSharing} from '../../users/my-tickets/details-ticket/details-ticket.component';

@Injectable({
  providedIn: 'root'
})
export class SharingService {

  private url = new UrlConfig();

  constructor(private cookieService: CookiesService,
              private http: HttpClient) {
  }

  public doSharing(item: string, type: string, dialCode: string) {
    return this.http.post(`${this.url.mainHost}/tickets/${type}/sharing`, item,
      {params: {username: this.getUsername(), dial: dialCode}, observe: 'response'});
  }

  public getSharing(id: string, type: string) {
    return this.http.get<TicketSharing>(`${this.url.mainHost}/tickets/${type}/sharing/${id}`,
      {params: {username: this.getUsername()}});
  }

  public revokeTicket(id: string, type: string) {
    return this.http.get(`${this.url.mainHost}/tickets/${type}/sharing/${id}/revoke`,
      {params: {username: this.getUsername()}, observe: 'response'});
  }

  public attributeTicket(type, id) {
    return this.http.post(`${this.url.mainHost}/tickets/${type}/sharing/${id}/attribute`, null,
      {params: {username: this.getUsername()}, observe: 'response'});
  }

  private getUsername() {
    return this.cookieService.getCookie('last_email');
  }
}
