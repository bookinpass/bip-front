import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FlightModel} from '../../models/amadeus/flight.model';
import {TravelerModel} from '../../models/amadeus/Traveler.model';
import {CompanyJson} from '../../../assets/compagnies.json';
import {CompagnieModel} from '../../models/compagnie.model';
import {AirportsJson} from '../../../assets/airports.json';
import {ActivatedRoute} from '@angular/router';
import {IClientAuthorizeCallbackData} from 'ngx-paypal';
import {DatePipe} from '@angular/common';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-print-flight-ticket',
  templateUrl: './print-flight-ticket.component.html',
  styleUrls: ['./print-flight-ticket.component.css']
})
export class PrintFlightTicketComponent implements OnInit, AfterViewInit {

  public ticket: FlightModel;
  public travelers: Array<TravelerModel>;
  public airlines: CompagnieModel;
  public details: IClientAuthorizeCallbackData;
  public from: string;
  public to: string;
  public transaction: string;
  public today = new Date();
  public listOfBookingRef = [];
  public loading = true;
  private airport = new AirportsJson().airport;

  constructor(private activatedRoute: ActivatedRoute,
              private datePipe: DatePipe) {
  }

  ngOnInit() {
    window.scroll({behavior: 'smooth', top: 0, left: 0});
    this.transaction = this.activatedRoute.snapshot.queryParamMap.get('order');
    this.ticket = JSON.parse(localStorage.getItem('ticket'));
    this.travelers = JSON.parse(localStorage.getItem('travelers'));
    this.travelers.forEach(() => {
      this.listOfBookingRef.push(this.getBookingRef());
    });
    this.details = JSON.parse(localStorage.getItem(this.transaction));
    this.airlines = new CompanyJson().companies.find(x => x.iata === this.ticket.validatingAirlineCodes[0]);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.captureScreen(), 3000);
  }

  public captureScreen() {
    const data = document.getElementsByClassName('ticket-container');
    const date = this.datePipe.transform(this.ticket.itineraries[0].segments[0].departure.at, 'dd MMMM yyyy');
    for (let i = 0; i < data.length; ++i) {
      html2canvas(data.item(i) as HTMLElement).then(canvas => {
        // Few necessary setting options
        const imgWidth = 208;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const heightLeft = imgHeight;

        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF
        pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, imgHeight);
        const names = 'BILLET ' + this.travelers[i].name.firstName.toUpperCase() + ' ' + this.travelers[i].name.lastName.toUpperCase();
        pdf.save(`${names}-${this.listOfBookingRef[i]}-${date}.pdf`, {returnPromise: true})
          .then(() => {
            this.loading = false;
          }); // Generated PDF
      });
    }
  }

  getChecking(at: Date) {
    const date = new Date(at);
    date.setHours(date.getHours() - 1);
    date.setSeconds(0);
    return this.datePipe.transform(date, 'dd/MM/yyyy à HH:mm');
  }

  public getAirport(iataCode: string) {
    const ap = this.airport.find(x => x.iata === iataCode);
    return `${ap.airportName}, ${ap.state} - ${ap.countryName}`;
  }

  public getBookingRef(): string {
    const length = 7;
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

}
