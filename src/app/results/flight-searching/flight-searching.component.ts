import {Component, OnDestroy, OnInit} from '@angular/core';
import {FlightSearchingService} from '../../services/searching/flight/flight-searching.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {Scavenger} from '@wishtack/rx-scavenger';
import {AirportsJson} from '../../../assets/airports.json';
import {SwalConfig} from '../../../assets/SwalConfig/Swal.config';
import {MatDialog} from '@angular/material/dialog';
import {GlobalErrorHandlerService} from '../../core/error/global-error-handler.service';
import {CompagnieModel} from '../../models/compagnie.model';
import {FlightSearchModel} from '../../models/flight-search.model';
import {AmadeusService} from '../../services/amadeus/amadeus.service';
import {DepartureOrArrival, FlightModel, ItinerariesEntity, TravelerPricingsEntity} from '../../models/amadeus/flight.model';
import {retry} from 'rxjs/operators';
import {FlightItineraryComponent} from './flight-itinerary/flight-itinerary.component';
import {CompanyJson} from '../../../assets/compagnies.json';
import {faClock, faPlaneArrival, faPlaneDeparture} from '@fortawesome/free-solid-svg-icons';
import {TravelerTypeEnum} from '../../models/TravelerType.enum';
import {FlightFilterModel} from '../../models/flight-filter.model';

@Component({
  selector: 'app-flight-searching',
  templateUrl: './flight-searching.component.html',
  styleUrls: ['./flight-searching.component.css']
})
export class FlightSearchingComponent implements OnInit, OnDestroy {

  public faClock = faClock;
  public faPlaneDeparture = faPlaneDeparture;
  public faPlaneArrival = faPlaneArrival;
  public loading = true;
  public updatingData = false;


  // filter variables
  public filterModel = new FlightFilterModel();
  public ticketModel: FlightSearchModel;
  public listOfCompanies = new Set<CompagnieModel>();
  public connectingAirports = new Set<string>();
  public filteredListOfFlights: Array<FlightModel> = new Array<FlightModel>();

  readonly sortList = [{id: 1, name: 'Prix'}, {id: 2, name: 'Durée'}];
  public sortBy: number;
  readonly companies = new CompanyJson();
  private applySort = false;
  private listOfFlights: Array<FlightModel> = new Array<FlightModel>();
  private swal = new SwalConfig();
  private scavenger: Scavenger = new Scavenger(this);
  private airports = new AirportsJson();

  constructor(private service: FlightSearchingService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              public dialog: MatDialog,
              private errorHandler: GlobalErrorHandlerService,
              private amadeusService: AmadeusService,
              private location: Location) {
  }

  ngOnInit() {
    if (this.activatedRoute.snapshot.queryParamMap.has('sortBy')) {
      const param = this.sortList.find(x => x.id === Number(this.activatedRoute.snapshot.queryParamMap.get('sortBy')));
      this.sortBy = param === null || param === undefined ? this.sortList[0].id : param.id;
      this.applySort = true;
    } else {
      this.sortBy = this.sortList[0].id;
    }
    this.getFlights();
  }

  ngOnDestroy(): void {
  }

  // ticket displaying
  public getAirline(code: string) {
    return this.companies.companies.find(x => x.iata === code);
  }

  public formatFlightDuration(duration: string) {
    const x = duration.split('H');
    const x1 = Number(x[0].replace(/[^0-9]/gi, ''));
    const x2 = Number(x[1].replace(/[^0-9]/gi, ''));

    return `${x1 > 9 ? x1 : '0' + x1}h ${x2 > 9 ? x2 : '0' + x2}min`;
  }

  openDetailsDialog(item: ItinerariesEntity) {
    this.dialog.open(FlightItineraryComponent, {
      panelClass: 'custom-itinerary-dialog',
      width: '450px',
      maxWidth: window.innerWidth > 576 ? '80vw' : '100vw',
      data: {
        itinerary: item,
      }
    });
  }

  public formatAirport(section: DepartureOrArrival) {
    const screen = window.innerWidth;
    const airport = this.airports.airport.find(x => x.iata.equalIgnoreCase(section.iataCode));
    airport.airportName = airport.airportName.replace(/airport/gi, '').trim();
    if (screen >= 768) {
      return `${airport.airportName}, ${airport.city}(${airport.countryCode})`;
    }
    return `${airport.city} (${airport.iata})`;
  }

  public checkTerminal(section: DepartureOrArrival) {
    if (section.terminal === null || section.terminal === undefined) {
      return '';
    }
    return ` - Terminal ${section.terminal}`;
  }

  public getPricing(pricing: TravelerPricingsEntity[]) {
    const mapPricing = new Map<string, number>();
    for (const x of pricing) {
      if (!mapPricing.has(x.travelerType)) {
        mapPricing.set(TravelerTypeEnum[x.travelerType], Number(x.price.total));
      }
    }
    return mapPricing;
  }

  public selectTicket(ticket: FlightModel) {
    localStorage.setItem('ticket', JSON.stringify(ticket));
    this.router.navigate(['details', 'flight']);
  }

  public sortFlights() {
    this.updatingData = true;
    this.router.navigate([], {queryParams: {sortBy: this.sortBy}, replaceUrl: true, queryParamsHandling: 'merge'});
    this.updatingData = false;
  }

  getFlights() {
    this.ticketModel = JSON.parse(localStorage.getItem('search_ticket'));
    if (this.ticketModel === null || this.ticketModel === undefined) {
      this.router.navigate(['/']);
    }
    this.amadeusService.searchFlight(this.ticketModel)
      .pipe(this.scavenger.collect(), retry(3))
      .subscribe(
        data => {
          if (data.length === 0) {
            this.swal.ErrorSwalWithReturn('Ooops!!!', 'Votre recherche n\'a donnee aucun resultat. Veuillez essayer avec une date differente')
              .then(res => {
                if (res.value) {
                  localStorage.removeItem('search_ticket');
                  this.router.navigate(['/']);
                }
              });
          } else {
            this.listOfFlights = data;
            this.filteredListOfFlights = this.listOfFlights;
            if (this.activatedRoute.snapshot.queryParamMap.has('min')) {
              const min = Number(this.activatedRoute.snapshot.queryParamMap.get('min'));
              this.filteredListOfFlights = this.filteredListOfFlights.filter(x => x.price.total >= min);
            }
            if (this.activatedRoute.snapshot.queryParamMap.has('max')) {
              const max = Number(this.activatedRoute.snapshot.queryParamMap.get('max'));
              this.filteredListOfFlights = this.filteredListOfFlights.filter(x => x.price.total <= max);
            }
          }
        },
        error => {
          if (error.status.toString().startsWith('5')) {
            this.swal.ErrorSwalWithReturn('Erreur', 'La connexion au serveur a échoué. Veuillez réessayer plus tard!')
              .then(res => {
                if (res.value) {
                  localStorage.removeItem('search_ticket');
                  this.router.navigateByUrl('/');
                }
              });
          }
        },
        () => {
          this.getConnectingAirports();
        });

  }

  // private async sortListByTDuration() {
  //   await this.listOfFlights.sort((x, y) => {
  //     const t1 = this.formatTimeForSorting(x.itineraries.map(t => t.duration));
  //     const t2 = this.formatTimeForSorting(y.itineraries.map(t => t.duration));
  //     console.log(t1[0], t1[1], t2[0], t2[1]);
  //     if (t1[0] === t2[0]) {
  //       return t1[1] > t2[1] ? 1 : t1[1] < t2[1] ? -1 : 0;
  //     }
  //     return t1[0] > t2[0] ? 1 : t1[0] < t2[0] ? -1 : 0;
  //   });
  // }
  //
  // private formatTimeForSorting(item: Array<string>) {
  //   let hh = 0;
  //   let mm = 0;
  //   item.forEach(time => {
  //     const tx = time.split('H');
  //     hh = hh + Number(tx[0].replace(/[^0-9]/gi, ''));
  //     mm = mm + Number(tx[1].replace(/[^0-9]/gi, ''));
  //   });
  //   while (mm > 60) {
  //     hh += 1;
  //     mm -= 60;
  //   }
  //   return {hh, mm};
  // }

  private getConnectingAirports() {
    this.filteredListOfFlights.forEach(flight => {
      flight.itineraries.forEach(itinerary => {
        if (itinerary.segments.length > 0) {
          for (const segment of itinerary.segments) {
            if (itinerary.segments.length > itinerary.segments.indexOf(segment) + 1) {
              this.connectingAirports.add(segment.arrival.iataCode);
            }
          }
        }
      });
      if (this.filteredListOfFlights.indexOf(flight) === this.filteredListOfFlights.length - 1) {
        if (this.activatedRoute.snapshot.queryParamMap.has('ex-ar') &&
          this.activatedRoute.snapshot.queryParamMap.get('ex-ar').trim().length > 0) {
          this.filterConnectingAirports(this.activatedRoute.snapshot.queryParamMap.get('ex-ar'));
        } else {
          this.orderConnectingAirports();
          this.getCompanies();
        }
      }
    });
  }

  private orderConnectingAirports() {
    const set = Array.from(this.connectingAirports);
    this.connectingAirports.clear();
    set.sort((x, y) => {
      const a = this.airports.airport.find(a1 => a1.iata === x);
      const b = this.airports.airport.find(b1 => b1.iata === y);
      return a.countryName > b.countryName ? 1 : a.countryName < b.countryName ? -1 : 0;
    }).forEach(x => this.connectingAirports.add(x));
  }

  private filterConnectingAirports(str: string) {
    const arp: Array<string> = str.trim().split(',');
    this.filteredListOfFlights.forEach(flight => {
      flight.itineraries.forEach(itinerary => {
        itinerary.segments.forEach(segment => {
          if (arp.indexOf(segment.departure.iataCode) >= 0 || arp.indexOf(segment.arrival.iataCode) >= 0) {
            this.filteredListOfFlights.splice(this.filteredListOfFlights.indexOf(flight), 1);
          }
        });
      });
      this.orderConnectingAirports();
      this.getCompanies();
    });
  }

  private getCompanies() {
    if (this.activatedRoute.snapshot.queryParamMap.has('ex-cp') &&
      this.activatedRoute.snapshot.queryParamMap.get('ex-cp').trim().length > 0) {
      this.activatedRoute.snapshot.queryParamMap.get('ex-cp').split(',')
        .forEach(x => {
          if (x.trim().length > 0) {
            this.listOfCompanies.add(this.companies.companies.find(y => y.iata === x.trim()));
          }
        });
    }
    this.filteredListOfFlights.forEach(flight => {
      this.listOfCompanies.add(this.companies.companies.find(x => x.iata === flight.validatingAirlineCodes[0]));
      if (this.filteredListOfFlights.indexOf(flight) === this.filteredListOfFlights.length - 1) {
        const set = Array.from(this.listOfCompanies);
        this.listOfCompanies.clear();
        set.sort((x, y) =>
          x.designation > y.designation ? 1 : x.designation < y.designation ? -1 : 0)
          .forEach(x => this.listOfCompanies.add(x));
        this.getVariables();
      }
    });
  }

  private getVariables() {
    this.filteredListOfFlights.forEach(flight => {
      if (flight.price.total < this.filterModel.minBudget) {
        this.filterModel.minBudget = Number(flight.price.total);
      }
      if (flight.price.total > this.filterModel.maxBudget) {
        this.filterModel.maxBudget = Number(flight.price.total);
      }
      if (this.filteredListOfFlights.indexOf(flight) === this.filteredListOfFlights.length - 1) {
        if (this.activatedRoute.snapshot.queryParamMap.has('ex-ar')) {
          this.filterAirports(this.activatedRoute.snapshot.queryParamMap.get('ex-ar'));
        } else {
          this.loading = false;
        }
      }
    });
  }

  private filterAirports(str: string) {
    const exAirports: Array<string> = Array.from(str.split(','));
    this.filteredListOfFlights.forEach(flight => {
      flight.itineraries.forEach(itinerary => {
        itinerary.segments.forEach(x => {
          if (exAirports.includes(x.departure.iataCode) || exAirports.includes(x.departure.iataCode)) {
            this.filteredListOfFlights.splice(this.filteredListOfFlights.indexOf(flight), 1);
          }
        });
      });
      if (this.filteredListOfFlights.indexOf(flight) === this.filteredListOfFlights.length - 1) {
        this.loading = false;
      }
    });
  }
}
