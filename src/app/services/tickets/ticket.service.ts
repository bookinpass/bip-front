import {Injectable} from '@angular/core';
import {UrlConfig} from '../../../assets/url.config';
import {HttpClient} from '@angular/common/http';
import {CookiesService} from '../cookie/cookies.service';
import {TicketEventModel} from '../../models/ticket-event.model';
import {TransportTicketModel} from '../../models/transport-ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private urlConfig = new UrlConfig();
  private host = this.urlConfig.mainHost;

  constructor(private http: HttpClient,
              private cookieService: CookiesService) {
  }

  public getTicketEventByRef(ref: string) {
    return this.http.get<Array<TicketEventModel>>(`${this.host}${this.urlConfig.searchEventByRef}/${ref}`);
  }

  public getTicketTransportByRef(ref: string) {
    return this.http.get<Array<TransportTicketModel>>(`${this.host}${this.urlConfig.searchTransportByRef}/${ref}`);
  }

}
