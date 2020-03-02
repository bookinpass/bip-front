import {AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {faChevronDown, faChevronUp} from '@fortawesome/free-solid-svg-icons';
import {AirportsJson} from '../../../../assets/airports.json';
import {ActivatedRoute, Router} from '@angular/router';
import {CompagnieModel} from '../../../models/compagnie.model';
import {FlightSearchModel} from '../../../models/flight-search.model';

@Component({
  selector: 'app-aside-filter',
  templateUrl: './aside-filter.component.html',
  styleUrls: ['./aside-filter.component.css']
})
export class AsideFilterComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() listOfCompanies: Set<CompagnieModel>;
  @Input() listOfConnectingAirports: Set<string>;

  public faDown = faChevronDown;
  public faUp = faChevronUp;
  public stopoverCollapse = true;
  public companyCollapse = true;
  public connectingAirportsCollapse = true;
  public includedCompanies = new Set<string>();
  public excludedAirports = new Set<string>();
  public ticket: FlightSearchModel;
  public min: number;
  public max: number;

  private airports = new AirportsJson();

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.min = this.activatedRoute.snapshot.queryParamMap.has('min') ? Number(this.activatedRoute.snapshot.queryParamMap.get('min'))
      : null;
    this.max = this.activatedRoute.snapshot.queryParamMap.has('max') ? Number(this.activatedRoute.snapshot.queryParamMap.get('max'))
      : null;
  }

  ngOnInit() {
    this.ticket = JSON.parse(localStorage.getItem('search_ticket'));
    this.ticket.includedAirlineCodes.split(',')
      .forEach(x => this.includedCompanies.add(x.trim()));
    if (this.activatedRoute.snapshot.queryParamMap.has('ex-ar') &&
      this.activatedRoute.snapshot.queryParamMap.get('ex-ar').trim().length > 0) {
      const arp: Array<string> = this.activatedRoute.snapshot.queryParamMap.get('ex-ar').trim().split(',');
      arp.forEach(x => {
        if (x.trim().length > 0) {
          this.excludedAirports.add(x.trim());
        }
      });
    }
    if (!this.activatedRoute.snapshot.queryParamMap.has('ex-cp')) {
      this.listOfCompanies.forEach(x => this.includedCompanies.add(x.iata));
    }
  }

  ngOnDestroy() {
  }

  ngAfterViewInit(): void {
    const matButton = $('.mat-button-toggle-label-content');
    matButton.addClass('pr-2 pt-0 pl-2 pb-0 font-weight-bold');
    matButton.prop('style', 'line-height:33px !important');
  }

  public getAirportsDetails(item: string) {
    const airport = this.airports.airport.find(s => s.iata === item);
    return airport.airportName + ' - ' + airport.state + ', ' + airport.countryName;
  }

  public filter() {
    const params: URLSearchParams = new URLSearchParams();

    if (this.min !== null && this.min > 0) {
      params['min'] = this.min;
    }
    if (this.max !== null && this.max > 0) {
      params['max'] = this.max;
    }
    if (this.ticket.includedAirlineCodes.startsWith(',')) {
      this.ticket.includedAirlineCodes = this.ticket.includedAirlineCodes.slice(1);
    }
    if (this.excludedAirports.size > 0) {
      params['ex-ar'] = Array.from(this.excludedAirports).join(',');
    }
    if (this.includedCompanies.size > 0 && this.includedCompanies.size < this.listOfCompanies.size) {
      params['ex-cp'] = Array.from(this.listOfCompanies).filter(x => !this.includedCompanies.has(x.iata)).map(x => x.iata).join(',');
      this.ticket.includedAirlineCodes = Array.from(this.includedCompanies).join(',');
    } else {
      this.ticket.includedAirlineCodes = '';
    }
    localStorage.setItem('search_ticket', JSON.stringify(this.ticket));
    this.router.navigate(['.'], {relativeTo: this.activatedRoute, queryParams: params});
  }

  public includeAllCompanies() {
    this.listOfCompanies.forEach(x => this.includedCompanies.add(x.iata));
  }

  public excludeAllAirports() {
    this.listOfConnectingAirports.forEach(x => this.excludedAirports.add(x));
  }
}
