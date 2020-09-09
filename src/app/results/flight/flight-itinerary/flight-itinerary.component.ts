import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {faPlane, faTimes} from '@fortawesome/free-solid-svg-icons';
import {faClock} from '@fortawesome/free-regular-svg-icons';
import {AirportsJson} from '../../../../assets/airports.json';
import {DomSanitizer} from '@angular/platform-browser';
import {ItinerariesEntity} from '../../../models/amadeuss/flight.model';
import {CompanyJson} from '../../../../assets/compagnies.json';

@Component({
    selector: 'app-flight-itinerary',
    templateUrl: './flight-itinerary.component.html',
    styleUrls: ['./flight-itinerary.component.css']
})
export class FlightItineraryComponent {

    faClose = faTimes;
    faClock = faClock;
    faPlane = faPlane;

    public itinerary: ItinerariesEntity;
    public airlineCode: string;
    public airportName: string;
    public city: string;
    private listOfCompanies = new CompanyJson();
    private airports = new AirportsJson();

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                public sanitizer: DomSanitizer) {
        this.itinerary = data.itinerary;
        this.airlineCode = this.itinerary.segments[0].carrierCode;
    }

    public getAirline(code: string) {
        return this.listOfCompanies.companies.find(x => x.iata === code);
    }

    public formatFlightDuration(duration: string) {
        const x = duration.split('H');
        return x[0].replace(/[^0-9]/gi, '') + 'h ' + x[1].replace(/[^0-9]/gi, '') + 'min';
    }

    public getAirport(iata: string) {
        const airport = this.airports.airport.find(x => x.iata === iata);
        const regex1 = new RegExp('international', 'ig');
        const regex2 = new RegExp('airport', 'ig');
        return airport.airportName
            .replace(regex1, 'INTL')
            .replace(regex2, '')
            .replace('  ', ' ')
            .trim();
    }

    public stopoverDuration(arrivedAt: Date, departAt: Date) {
        let delta = Math.abs(new Date(departAt).valueOf() - new Date(arrivedAt).valueOf()) / 1000;
        const days = Math.floor(delta / 86400);
        delta -= days * 86400;
        const hours = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;
        const minutes = Math.floor(delta / 60) % 60;
        return `${days === 0 ? '' : '  '.concat(days.toString(10)).concat(days > 1 ? ' jours, ' : ' jour, ')}
    ${hours > 10 ? hours : '0' + hours}` + 'H ' + `${minutes > 10 ? minutes : '0' + minutes}` + ' min';
    }

    public getCity(iata: string) {
        const airport = this.airports.airport.find(x => x.iata === iata);
        return `${airport.state}, ${airport.countryName}`;
    }

    public checkTerminals(i: number) {
        if ((this.itinerary.segments[i].arrival.terminal === null || this.itinerary.segments[i].arrival.terminal === undefined) ||
            (this.itinerary.segments[i + 1].departure.terminal === null || this.itinerary.segments[i + 1].arrival.terminal === null))
            return false;
        return this.itinerary.segments[i].arrival.terminal.equalIgnoreCase(this.itinerary.segments[i + 1].departure.terminal);
    }
}
