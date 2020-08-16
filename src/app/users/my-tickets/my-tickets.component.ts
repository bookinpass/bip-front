import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../../services/user/user.service';
import {Scavenger} from '@wishtack/rx-scavenger';
import {GlobalErrorHandlerService} from '../../core/error/global-error-handler.service';
import {TransportTicketModel} from '../../models/transport-ticket.model';
import {differenceInHours, isAfter, parseISO} from 'date-fns';
import {now} from 'moment';
import {TicketEventModel} from '../../models/ticket-event.model';
import {EventModel} from '../../models/event.model';
import {EventService} from '../../services/event/event.service';
import {MatDialog} from '@angular/material/dialog';
import {DetailsTicketComponent} from './details-ticket/details-ticket.component';
import * as _ from 'underscore';

@Component({
  selector: 'app-my-tickets',
  templateUrl: './my-tickets.component.html',
  styleUrls: ['./my-tickets.component.css']
})
export class MyTicketsComponent implements OnInit, OnDestroy {

  public transportTickets: Array<TransportTicketModel>;
  public eventTickets: Array<TicketEventModel>;
  private events: Array<EventModel>;
  private scavenger = new Scavenger(this);

  constructor(private userService: UserService,
              private eventService: EventService,
              private errorHandler: GlobalErrorHandlerService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.getTransportTickets();
    this.getEventTickets();
  }

  ngOnDestroy(): void {
  }

  public ticketDetails(item: any, type: string) {
    const dlg = this.dialog.open(DetailsTicketComponent, {
      width: window.innerWidth > 400 ? '550px' : '380px',
      height: 'max-content',
      id: 'user-details-ticket-dialog',
      hasBackdrop: true,
      disableClose: true,
      closeOnNavigation: true,
      data: {
        type,
        item
      }
    });
    dlg.afterClosed()
      .subscribe(data => {
      });
  }

  public pipeDate(dt: Date) {
    return new Date(dt);
  }

  public getLinkedEvent(item: TicketEventModel) {
    return this.events.find(x => x.eventId === item.eventId);
  }

  // noinspection JSMethodCanBeStatic
  private checkExpiry(item: TransportTicketModel) {
    const date = new Date(item.departDate);
    const times = item.departTime.toString().split(':');
    date.setHours(Number(times[0]));
    date.setMinutes(Number(times[1]));
    return differenceInHours(parseISO(date.toISOString()), new Date(now())) < 1;
  }

  private getTransportTickets() {
    this.userService.getTransportTickets()
      .pipe(this.scavenger.collect())
      .subscribe(res => {
          res.forEach(x => {
            if (this.checkExpiry(x)) x.codeTicket = 'EXPIRER';
          });
          this.transportTickets = res;
        },
        err => {
          this.errorHandler.handleError(err);
          location.reload();
        });
  }

  private getEventTickets() {
    this.userService.getEventTickets()
      .pipe(this.scavenger.collect())
      .subscribe(res => {
        const ids = _.uniq(res.map(x => {
          return x.eventId;
        }));
        this.getEvents(ids, res);
      }, err => {
        this.errorHandler.handleError(err);
        location.reload();
      });
  }

  private getEvents(ids: Array<string>, res) {
    this.eventService.getListedEvents(ids)
      .pipe(this.scavenger.collect())
      .subscribe(ele => {
          this.events = ele;
          ele.forEach(item => {
            if (!isAfter(parseISO(item.startingDate.toString()), new Date(now())))
              res.find(x => x.eventId === item.eventId).codeTicket = 'EXPIRER';
          });
        }, err => {
          this.errorHandler.handleError(err);
          location.reload();
        },
        () => this.eventTickets = res);
  }
}
