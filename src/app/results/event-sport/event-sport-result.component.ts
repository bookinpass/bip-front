import {Component, OnDestroy, OnInit} from '@angular/core';
import {Scavenger} from '@wishtack/rx-scavenger';
import {EventService} from '../../services/event/event.service';
import {ActivatedRoute, Router} from '@angular/router';
import {EventSearchModel} from '../../models/event-search.model';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {retry} from 'rxjs/operators';
import {GlobalErrorHandlerService} from '../../core/error/global-error-handler.service';
import {EventModel} from '../../models/event.model';
import {VariableConfig} from '../../../assets/variable.config';
import {DatePipe, Location} from '@angular/common';
import {PlaceModel} from '../../models/place.model';
import {isEqual} from 'date-fns';
import {isDate} from 'moment';

@Component({
  selector: 'app-event-searching',
  templateUrl: './event-sport-result.component.html',
  styleUrls: ['./event-sport-result.component.css']
})
export class EventSportResultComponent implements OnInit, OnDestroy {

  public loading = true;
  public option: string;
  public varRepo = new VariableConfig();
  public category: string;
  public eventSearch = new EventSearchModel();
  public listOfEvents: Array<EventModel> = new Array<EventModel>();
  public images = new Map<string, SafeUrl>();
  public markedList = new Set<EventModel>();
  public unmarkedList = new Set<EventModel>();
  public allPlaces = new Array<PlaceModel>();
  public listOfPlacesId = new Array<number>();
  private scavenger = new Scavenger(this);

  constructor(private router: Router,
              private location: Location,
              private activatedRoute: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private eventService: EventService,
              private errorHandler: GlobalErrorHandlerService,
              private datePipe: DatePipe) {
  }

  ngOnInit() {
    !this.activatedRoute.snapshot.queryParamMap.has('option') ||
    !['event', 'sport'].includes(this.activatedRoute.snapshot.queryParamMap.get('option').toLowerCase()) ? this.location.back() :
      this.option = this.activatedRoute.snapshot.queryParamMap.get('option');
    this.getParameters();
    this.getAllPlaces();
  }

  ngOnDestroy(): void {
  }

  public validateEventDate() {
    this.eventSearch.formattedDate = this.datePipe.transform(this.eventSearch.date || new Date(), 'yyyy-MM-dd');
  }

  public getSelectedPlaces() {
    return this.allPlaces.filter(x => this.listOfPlacesId.indexOf(x.placeId) !== -1);
  }

  public updatePlaces(placeId: number, isAdding: boolean) {
    this.loading = true;
    isAdding ? this.listOfPlacesId.push(placeId) : this.listOfPlacesId.splice(this.listOfPlacesId.indexOf(placeId), 1);
    this.setMarkedAndUnmarkedList();
  }

  public updateList() {
    this.loading = true;
    const places = this.listOfPlacesId.length > 0 ? this.listOfPlacesId.join(',') : null;
    let date = '';
    let place = '';
    if (isDate(this.eventSearch.date)) {
      date = '&date=' + this.datePipe.transform(this.eventSearch.date, 'yyyy-MM-dd');
    }
    if (places !== null) {
      place = '&place=' + places;
    }
    window.history.pushState({}, '',
      `/search/events?option=${this.option}&category=${this.category.toLowerCase()}${date}${place}`);
    this.setMarkedAndUnmarkedList();
  }

  public selectTicket(eventId: string) {
    this.router.navigate(['details', 'event', eventId]);
  }

  private getParameters() {
    this.activatedRoute.queryParams
      .pipe(this.scavenger.collect())
      .subscribe(data => {
        this.category = data.category;
        this.eventSearch.date = data.date;
        if (data.places !== null && data.places !== undefined) {
          data.places.split(',').forEach(x => this.listOfPlacesId.push((Number(x))));
        }
        this.eventSearch.keyword = data.keywords === null || data.keywords === undefined ? new Array<string>() : data.keywords.split(',');
        this.getEvents();
      });
  }

  private getEvents() {
    this.eventService.comingEvents()
      .pipe(this.scavenger.collect(), retry(3))
      .subscribe(data => {
        this.listOfEvents = data.sort((x, y) => {
          return x.startingDate > y.startingDate ? 1 : x.startingDate < y.startingDate ? -1 : 0;
        });
        this.setMarkedAndUnmarkedList();
        this.getImages();
      }, error => this.errorHandler.handleError(error));
  }

  private getImages() {
    this.listOfEvents
      .map(x => `${x.eventId}-${x.imageTimestamp}`)
      .forEach(name =>
        this.images.set(name.split('-')[0], this.sanitizer.bypassSecurityTrustUrl(`../../../assets/images/event/${name}.jpg`)));
  }

  private setMarkedAndUnmarkedList() {
    let selectedList = (this.option.equalIgnoreCase('event') ?
      this.listOfEvents.filter(x => !['FOOTBALL', 'BASKETBALL', 'LUTTE'].includes(x.eventType.toUpperCase())) :
      this.listOfEvents.filter(x => ['FOOTBALL', 'BASKETBALL', 'LUTTE'].includes(x.eventType.toUpperCase())));
    if (isDate(this.eventSearch.date)) {
      selectedList = selectedList.filter(x => isEqual(new Date(x.startingDate), new Date(this.eventSearch.date)));
    }
    if (!this.category.equalIgnoreCase('tout')) {
      selectedList = selectedList.filter(x => x.eventType.equalIgnoreCase(this.category));
    }
    if (this.listOfPlacesId.length > 0) {
      this.markedList = new Set(selectedList.filter(x => this.listOfPlacesId.indexOf(x.place.placeId) !== -1));
    } else {
      this.markedList = new Set<EventModel>(selectedList);
    }
    selectedList = this.option.equalIgnoreCase('event') ?
      this.listOfEvents.filter(x => !['FOOTBALL', 'BASKETBALL', 'LUTTE'].includes(x.eventType.toUpperCase())) :
      this.listOfEvents.filter(x => ['FOOTBALL', 'BASKETBALL', 'LUTTE'].includes(x.eventType.toUpperCase()));
    this.unmarkedList = new Set<EventModel>(selectedList.filter(x => !this.markedList.has(x)));
    this.loading = false;
  }

  private getAllPlaces() {
    this.eventService.getPlaces()
      .pipe(this.scavenger.collect(), retry(1))
      .subscribe(data => this.allPlaces = data);
  }
}
