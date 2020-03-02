import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SwalConfig} from '../../../../assets/SwalConfig/Swal.config';
import {Params, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {DatePipe} from '@angular/common';
import {VariableConfig} from '../../../../assets/variable.config';
import {PlaceModel} from '../../../models/place.model';
import {EventSearchModel} from '../../../models/event-search.model';
import {EventService} from '../../../services/event/event.service';
import {Scavenger} from '@wishtack/rx-scavenger';
import {retry} from 'rxjs/operators';

@Component({
  selector: 'app-event-sport',
  templateUrl: './event-sport.component.html',
  styleUrls: ['./event-sport.component.css']
})
export class EventSportComponent implements OnInit, OnDestroy {

  @Input() option: string;
  @Input() sportType: number; // [1: football, 2: basketball, 3: lutte]

  public loading = false;
  public eventSearch = new EventSearchModel();
  public variableConfig = new VariableConfig();
  public eventType = 'tout';
  public allPlaces: Array<PlaceModel>;
  public today = new Date();
  private scavenger = new Scavenger(this);

  constructor(private router: Router,
              private http: HttpClient,
              private datePipe: DatePipe,
              private eventService: EventService) {
  }

  ngOnInit() {
    this.getPlaces();
  }

  ngOnDestroy(): void {
  }

  public validateEventDate() {
    this.eventSearch.formattedDate = this.datePipe.transform(this.eventSearch.date, 'yyyy-MM-dd');
  }

  public eventPlacesSelection($event: Array<number>) {
    this.eventSearch.places.clear();
    $event.forEach(x => {
      this.eventSearch.places.add(this.allPlaces.find(y => y.placeId === x));
    });
  }

  public searchEvent() {
    if (this.eventSearch.date <= new Date()) {
      new SwalConfig().ErrorSwalWithNoReturn('Erreur', 'Veuillez sélectionner une date supérieur au ' +
        this.datePipe.transform(new Date(), 'longDate', 'GMT'));
    } else {
      const param: Params = {
        option: this.option.toLowerCase(),
        category: this.option.equalIgnoreCase('event') ? this.setEventType().toLowerCase() : this.setSportType().toLowerCase(),
        date: this.eventSearch.formattedDate
      };
      if (this.eventSearch.keyword.length > 0) {
        param.keywords = this.eventSearch.keyword.join(',').toLowerCase();
      }
      if (this.eventSearch.places.size > 0) {
        param.places = Array.from(this.eventSearch.places.values()).map(x => x.placeId).join(',');
      }
      this.router.navigate(['search', 'events'], {queryParams: param});
    }
  }

  private setSportType(): string {
    return this.sportType === 1 ? 'football' : this.sportType === 2 ? 'basketball' : 'lutte';
  }

  private setEventType() {
    return this.eventType.equalIgnoreCase('') ? 'TOUT' : this.eventType.toUpperCase();
  }

  private getPlaces() {
    this.loading = true;
    this.eventService.getPlaces()
      .pipe(this.scavenger.collect(), retry(3))
      .subscribe(data => this.allPlaces = data,
        _ => _,
        () => this.loading = false);
  }
}
