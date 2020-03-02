import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharingDataService {

  // private data = new BehaviorSubject(new FlightModel());
  // ticket = this.data.asObservable();

  constructor() {
  }

  //
  // updateTicket(ticket: FlightModel) {
  //   this.data.next(ticket);
  // }
}
