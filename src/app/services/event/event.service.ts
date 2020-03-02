import {Injectable} from '@angular/core';
import {UrlConfig} from '../../../assets/url.config';
import {HttpClient} from '@angular/common/http';
import {EventModel} from '../../models/event.model';
import {PlaceModel} from '../../models/place.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private urlConfig = new UrlConfig();
  private host = this.urlConfig.eventHost;
  private getPlacesUrl = this.urlConfig.getPlaces;
  private comingEventsUrl = this.urlConfig.comingEvents;
  private eventById = this.urlConfig.eventById;
  private nextEvents = this.urlConfig.nextEvents;

  constructor(private http: HttpClient) {
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

  public getNextEvents(limit?: number) {
    const suffix = limit !== null && limit !== undefined ? `?limit=${limit}` : '';
    return this.http.get<Map<string, Array<EventModel>>>(this.host + this.nextEvents + suffix);
  }

}
