import {Injectable} from '@angular/core';
import {UrlConfig} from '../../../assets/url.config';
import {HttpClient} from '@angular/common/http';
import {EventModel} from '../../models/event.model';
import {PlaceModel} from '../../models/place.model';
import {CookiesService} from "../cookie/cookies.service";

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private urlConfig = new UrlConfig();
  private host = this.urlConfig.mainHost;
  private getPlacesUrl = this.urlConfig.getPlaces;
  private comingEventsUrl = this.urlConfig.comingEvents;
  private eventById = this.urlConfig.eventById;
  private nextEvents = this.urlConfig.nextEvents;

  constructor(private http: HttpClient,
              private cookieService: CookiesService) {
  }

  public getPlaces() {
    return this.http.get<PlaceModel[]>(this.host + this.getPlacesUrl);
  }

  public comingEvents() {
    return this.http.get<Array<EventModel>>(this.host + this.comingEventsUrl);
  }

  public getAnEvent(id: string) {
    return this.http.get<EventModel>(this.host + this.eventById + id);
  }

  public getListedEvents(list: Array<string>) {
    const currentUser = this.cookieService.getCookie('last_email') as string;
    return this.http.post<Array<EventModel>>(`${this.host}/event/listed`, list, {params: {username: currentUser}});
  }

  public getNextEvents(limit?: number) {
    const suffix = limit !== null && limit !== undefined ? `?limit=${limit}` : '';
    return this.http.get<Map<string, Array<EventModel>>>(this.host + this.nextEvents + suffix);
  }

}
