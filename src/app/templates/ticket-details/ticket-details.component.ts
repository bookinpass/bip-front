import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {faPlaneDeparture} from '@fortawesome/free-solid-svg-icons';
import {AirportsJson} from '../../../assets/airports.json';
import {DomSanitizer} from '@angular/platform-browser';
import {FlightModel, SegmentsEntity} from '../../models/amadeuss/flight.model';
import {CompanyJson} from '../../../assets/compagnies.json';
import {CompagnieModel} from '../../models/compagnie.model';

@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.css']
})
export class TicketDetailsComponent implements OnInit, OnDestroy {

  @Input() ticket: FlightModel;

  public faDeparture = faPlaneDeparture;
  public company: CompagnieModel;
  private airports = new AirportsJson();

  constructor(public sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.company = new CompanyJson().companies.find(x => x.iata === this.ticket.validatingAirlineCodes[0]);
  }

  ngOnDestroy(): void {
  }

  public getFlightNumber(segment: SegmentsEntity) {
    return segment.carrierCode + segment.number;
  }

  public formatAirport(iata: string): string {
    const apt = this.airports.airport.find(x => x.iata === iata);
    apt.airportName = apt.airportName
      .replace(new RegExp('international', 'ig'), 'INTL')
      .replace(new RegExp('airport', 'ig'), '')
      .replace('  ', ' ')
      .trim();
    return `Aéroport ${apt.airportName}, ${apt.state}, ${apt.countryName}`.trim();
  }
}
