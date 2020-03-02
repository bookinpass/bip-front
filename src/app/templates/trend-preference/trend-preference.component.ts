import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {EventService} from '../../services/event/event.service';
import {Scavenger} from '@wishtack/rx-scavenger';
import {retry} from 'rxjs/operators';
import {EventModel} from '../../models/event.model';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ImageService} from '../../services/images/image.service';
import {ImageBase64} from '../../../assets/images/base64/image.base64';
import {faBars, faFutbol, faPlane, faStar} from '@fortawesome/free-solid-svg-icons';
import {MatDialog} from '@angular/material/dialog';
import {ChooseFlightDialogComponent} from './choose-flight-dialog/choose-flight-dialog.component';
import {FlightSearchModel} from '../../models/flight-search.model';

@Component({
  selector: 'app-trend-preference',
  templateUrl: './trend-preference.component.html',
  styleUrls: ['./trend-preference.component.css']
})
export class TrendPreferenceComponent implements OnInit, OnDestroy {

  public faList = faBars;
  public faPlane = faPlane;
  public faBall = faFutbol;
  public faEvent = faStar;

  public width = window.innerWidth;
  public selectedTrend = 1;
  public numberOfFetchedItem = 8;
  public fetchingEvents = true;
  public listOfEvents: Array<EventModel> = new Array<EventModel>();
  public listOfSports: Array<EventModel> = new Array<EventModel>();
  public listImage: Map<string, SafeUrl> = new Map<string, SafeUrl>();
  public noImage = new ImageBase64().noImageFR;
  public topFlight = [
    {code: 'ABJ', country: 'Abidjan', img: '../../../assets/images/cities/ABJ.png'},
    {code: 'CAS', country: 'Casablanca', img: '../../../assets/images/cities/CAS.png'},
    {code: 'CDG', country: 'Paris', img: '../../../assets/images/cities/CDG.png'},
    {code: 'BKO', country: 'Bamako', img: '../../../assets/images/cities/BKO.png'},
    {code: 'LHR', country: 'Londres', img: '../../../assets/images/cities/LHR.png'},
    {code: 'ADD', country: 'Addis-abeba', img: '../../../assets/images/cities/ADD.png'},
    {code: 'NBO', country: 'Nairobie', img: '../../../assets/images/cities/NBO.png'},
    {code: 'BRU', country: 'Bruxelles', img: '../../../assets/images/cities/BRU.png'},
  ];
  private scavenger = new Scavenger(this);

  constructor(private router: Router,
              private eventService: EventService,
              private imageService: ImageService,
              private sanitizer: DomSanitizer,
              public dialog: MatDialog) {
  }

  ngOnInit() {
    for (let i = 0; i < 6; i++) {
      this.listOfEvents.push(new EventModel());
      this.listOfSports.push(new EventModel());
    }
    this.getComingEvents();
  }

  ngOnDestroy(): void {
  }

  public selectItem(eventId: string) {
    this.router.navigate(['details', 'event', eventId]);
  }

  public selectDestination(code: string) {
    const selected = this.topFlight.find(x => x.code === code);
    const dialogRef = this.dialog.open(ChooseFlightDialogComponent, {
      width: '445px',
      height: 'auto',
      hasBackdrop: true,
      disableClose: true,
      closeOnNavigation: true,
      data: {
        code: selected.code,
        country: selected.country,
        img: selected.img
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      const ticket = new FlightSearchModel();
      ticket.nonStop = false;
      ticket.fromIata = 'DSS';
      ticket.toIata = selected.code;
      ticket.oneWay = true;
      ticket.departure = result.toString();
      localStorage.setItem('search_ticket', JSON.stringify(ticket));
      this.router.navigate(['search', 'flights']);
    });
  }

  private getComingEvents() {
    this.eventService.getNextEvents(this.numberOfFetchedItem)
      .pipe(this.scavenger.collect(),
        retry(2))
      .subscribe((data) => {
          this.listOfEvents = data['event'];
          this.listOfSports = data['sport'];
        },
        _ => _,
        () => {
          this.getImage();
          this.fetchingEvents = false;
        });
  }

  private getImage() {
    const list = this.listOfEvents.map(x => x.eventId);
    this.listOfSports.map(x => x.eventId).forEach(x => list.push(x));
    list.forEach(ids => {
      this.imageService.getImage('event', ids)
        .pipe(this.scavenger.collect(),
          retry(1))
        .subscribe(data => {
          const d: any = data.body;
          this.listImage.set(ids, this.sanitizer.bypassSecurityTrustUrl(d.content.toString()));
        }, _ => this.listImage.set(ids, this.sanitizer.bypassSecurityTrustUrl(this.noImage)));
    });
  }

}
