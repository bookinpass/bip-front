import {Injectable} from '@angular/core';
import {UrlConfig} from '../../../assets/url.config';
import {CookiesService} from '../cookie/cookies.service';
import {HttpClient} from '@angular/common/http';
import {TransportTicketModel} from '../../models/transport-ticket.model';
import {TicketEventModel} from '../../models/ticket-event.model';
import {UserModel} from '../../models/User.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private urls = new UrlConfig();

  constructor(private cookiesService: CookiesService,
              private http: HttpClient) {
  }

  public getUser() {
    return this.http.get<UserModel>(`${this.urls.mainHost}/user/search`, {params: {username: this.getUsername()}});
  }

  public getTransportTickets() {
    return this.http.get<Array<TransportTicketModel>>(`${this.urls.mainHost}/user/${this.getUsername()}/tickets/transport`);
  }

  public getEventTickets() {
    return this.http.get<Array<TicketEventModel>>(`${this.urls.mainHost}/user/${this.getUsername()}/tickets/event`);
  }

  public updatePassword(oldPassword: string, newPassword: string) {
    return this.http.post(`${this.urls.mainHost}/password`,
      JSON.stringify({username: this.getUsername(), oldPassword, newPassword}), {observe: 'response'});
  }

  public updateUser(user: UserModel) {
    return this.http.post(`${this.urls.mainHost}/user/${this.getUsername()}/profile`, JSON.stringify(user), {observe: 'response'});
  }

  private getUsername() {
    return this.cookiesService.getCookie('last_email');
  }

}
