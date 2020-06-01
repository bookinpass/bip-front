import {Component, OnDestroy, OnInit} from '@angular/core';
import {faClock, faPlaneArrival, faPlaneDeparture} from '@fortawesome/free-solid-svg-icons';
import {FlightSearchModel} from '../../models/amadeus/flight-search.model';
import {AmadeusService} from '../../services/amadeus/amadeus.service';
import {DatePipe} from '@angular/common';
import {Scavenger} from "@wishtack/rx-scavenger";
import {retry} from "rxjs/operators";
import {FlightOfferResponseModel} from "../../models/amadeus/flight-offer-response.model";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {

  public faClock = faClock;
  public faPlaneDeparture = faPlaneDeparture;
  public faPlaneArrival = faPlaneArrival;
  public loading = true;

  public searchModel: FlightSearchModel;
  private result: FlightOfferResponseModel;
  private scavenger = new Scavenger(this);

  constructor(private amadeusService: AmadeusService,
              private datePipe: DatePipe,
              private router: Router,
              private matDialog: MatDialog) {
  }

  async ngOnInit() {
    await this.amadeusService.setToken();
    this.searchModel = JSON.parse(localStorage.getItem('search-data')) as FlightSearchModel;
    if (this.searchModel === null || this.searchModel === undefined) await this.router.navigate(['/'])
    this.searchFlights();
  }

  ngOnDestroy() {
    this.scavenger.unsubscribe();
  }

  private searchFlights() {
    const departDate = this.datePipe.transform(this.searchModel.departDate, 'yyyy-MM-dd', 'UTC');
    const returnDate = this.datePipe.transform(this.searchModel.returnDate, 'yyyy-MM-dd', 'UTC');
    this.amadeusService.getFlights(this.searchModel.from, this.searchModel.to, departDate, this.searchModel.travelClass,
      this.searchModel.nonStop ? 'true' : 'false', this.searchModel.adults, this.searchModel.children, this.searchModel.infants,
      this.searchModel.max, this.searchModel.currencyCode, returnDate, this.searchModel.includedAirlineCodes,
      this.searchModel.excludedAirlineCodes)
      .pipe(this.scavenger.collect(), retry(2))
      .subscribe(data => this.result = data,
        error => console.log(error),
        () => console.log(this.result));
  }

}
