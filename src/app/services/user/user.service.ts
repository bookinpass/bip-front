import {Injectable} from '@angular/core';
import {UrlConfig} from '../../../assets/url.config';
import {CookiesService} from '../cookie/cookies.service';
import {HttpClient} from '@angular/common/http';
import {TransportTicketModel} from '../../models/transport-ticket.model';
import {EventTicketModel} from '../../models/event-ticket.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private urls = new UrlConfig();

  constructor(private cookiesService: CookiesService,
              private http: HttpClient) {
  }

  public getTransportTickets() {
    const currentUser = this.cookiesService.getCookie('last_email') as string;
    return this.http.get<Array<TransportTicketModel>>(`${this.urls.eventHost}/user/${currentUser}/tickets/transport`);
  }

  public getEventTickets() {
    const currentUser = this.cookiesService.getCookie('last_email') as string;
    return this.http.get<Array<EventTicketModel>>(`${this.urls.eventHost}/user/${currentUser}/tickets/event`);
  }
}
