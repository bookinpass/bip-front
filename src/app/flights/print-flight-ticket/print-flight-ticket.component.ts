import {AfterViewInit, Component, OnInit} from '@angular/core';
import {TravelerModel} from '../../models/amadeuss/Traveler.model';
import {CompagnieModel} from '../../models/compagnie.model';
import {AirportsJson} from '../../../assets/airports.json';
import {ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';
import {AmadeusService} from '../../services/amadeus/amadeus.service';
import {FlightCreateOrderResponseModel} from '../../models/amadeus/flight-create-order-response.model';
import {AssociatedRecordsModel, FlightCreateOrderModel} from '../../models/amadeus/flight-create-order.model';
import {FlightOfferModel} from '../../models/amadeus/flight-offer.model';
import {CompanyJson} from '../../../assets/compagnies.json';

@Component({
  selector: 'app-print-flight-ticket',
  templateUrl: './print-flight-ticket.component.html',
  styleUrls: ['./print-flight-ticket.component.css']
})
export class PrintFlightTicketComponent implements OnInit, AfterViewInit {

  public ticket: FlightCreateOrderResponseModel;
  public data: FlightCreateOrderModel;
  public offer: FlightOfferModel;
  public height: string;

  public travelers: Array<TravelerModel>;
  public airlines: CompagnieModel;
  public from: string;
  public to: string;
  public transaction: string;
  public today = new Date();
  public listOfBookingRef = [];
  public loading = true;

  private ticketRef: string;
  private airport = new AirportsJson().airport;

  constructor(private activatedRoute: ActivatedRoute,
              private datePipe: DatePipe,
              private amadeusService: AmadeusService) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.ticketRef = params.get('ref');
      if (this.ticketRef === null || this.ticketRef === undefined || this.ticketRef.length <= 0) {
        this.ticketRef = sessionStorage.getItem('amadeus_order_id');
      }
    });
  }

  async ngOnInit() {
    const headerHeight = $('header')[0].offsetHeight;
    const footerHeight = $('footer')[0].offsetHeight;
    this.height = (window.innerHeight - headerHeight - footerHeight).toString(10) + 'px';
    await this.amadeusService.setToken();
    this.ticket = await this.amadeusService.getOrder(this.ticketRef);
    this.data = this.ticket.data;
    this.offer = this.data.flightOffers[0];
    this.loading = false;
    // this.transaction = this.activatedRoute.snapshot.queryParamMap.get('order');
    // this.ticket = JSON.parse(sessionStorage.getItem('ticket'));
    // this.travelers = JSON.parse(sessionStorage.getItem('travelers'));
    // this.travelers.forEach(() => {
    //   this.listOfBookingRef.push(this.getBookingRef());
    // });
    this.airlines = new CompanyJson().companies.find(x => x.iata === this.offer.validatingAirlineCodes[0]);
  }

  ngAfterViewInit(): void {
    // setTimeout(() => this.captureScreen(), 1000);
  }

  // public captureScreen() {
  //   const data = document.getElementsByClassName('ticket-container');
  //   const date = this.datePipe.transform(this.ticket.itineraries[0].segments[0].departure.at, 'dd MMMM yyyy');
  //   for (let i = 0; i < data.length; ++i) {
  //     html2canvas(data.item(i) as HTMLElement).then(canvas => {
  //       // Few necessary setting options
  //       const imgWidth = 208;
  //       const imgHeight = canvas.height * imgWidth / canvas.width;
  //
  //       const contentDataURL = canvas.toDataURL('image/png');
  //       const pdf = new jsPDF({
  //         orientation: 'p',
  //         unit: 'mm',
  //         format: 'a4'
  //       }); // A4 size page of PDF
  //       pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, imgHeight);
  //       const names = 'BILLET ' + this.travelers[i].name.firstName.toUpperCase() + ' ' + this.travelers[i].name.lastName.toUpperCase();
  //       // @ts-ignore
  //       pdf.save(`${names}-${this.listOfBookingRef[i]}-${date}.pdf`, {returnPromise: true}).then(
  //         _ => this.loading = false); // Generated PDF
  //     });
  //   }
  // }

  getChecking(at: any) {
    const date = new Date(at);
    date.setHours(date.getHours() - 1);
    date.setSeconds(0);
    return this.datePipe.transform(date, 'dd/MM/yyyy à HH:mm');
  }

  public getAirport(iataCode: string) {
    const ap = this.airport.find(x => x.iata === iataCode);
    return `${ap.airportName}, ${ap.state} - ${ap.countryName}`;
  }

  public getDate(associatedRecords: Array<AssociatedRecordsModel>) {
    let date;
    associatedRecords.forEach(x => {
      if (x.creationDate !== null && x.creationDate !== undefined && x.creationDate.length > 0) {
        date = x.creationDate;
      }
    });
    return !date ? null : this.datePipe.transform(date, 'dd MMMM yyyy', 'UTC');
  }
}
