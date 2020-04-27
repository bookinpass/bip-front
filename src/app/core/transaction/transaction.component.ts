import {Component, OnDestroy, OnInit} from '@angular/core';
import {retry} from 'rxjs/operators';
import {SwalConfig} from '../../../assets/SwalConfig/Swal.config';
import {Scavenger} from '@wishtack/rx-scavenger';
import {EventService} from '../../services/event/event.service';
import {EventModel} from '../../models/event.model';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {GlobalErrorHandlerService} from '../error/global-error-handler.service';
import {TicketEventModel} from '../../models/ticket-event.model';
import {TicketService} from '../../services/tickets/ticket.service';
import Swal from 'sweetalert2';
import * as jspdf from 'jspdf';
import html2canvas from "html2canvas";
import {now} from "moment";
import {TransportTicketModel} from "../../models/transport-ticket.model";

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit, OnDestroy {

  public eventTickets: Array<TicketEventModel>;
  public transportTickets: Array<TransportTicketModel>;
  public loading = true;
  public status: string;
  public type: string;
  public idEvent: string;
  public event: EventModel;
  private idTransaction: string;
  private items: number;
  private scavenger = new Scavenger(this);

  constructor(private eventService: EventService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private errorHandler: GlobalErrorHandlerService,
              private ticketService: TicketService) {
    router.events
      .subscribe(val => {
        if (val instanceof NavigationEnd) {
          this.activatedRoute.queryParamMap
            .subscribe((params: any) => {
              this.status = params.params.status;
              this.idTransaction = params.params.ref;
              this.items = Number(params.params.items);
              this.idEvent = params.params.id;
              this.type = params.params.type;
            }, _ => _);
        }
      });
  }

  ngOnInit(): void {
    if (this.status === 'succeed') {
      let msg: string;
      if (this.items === 1) msg = 'L\'achat de votre ticket a réussi. Vous pouvez proceder au téléchargement de votre ticket. Si vous' +
        ' souhaitez partager votre ticket avec un de vos proches, veuillez vous rendre dans votre espace personnel.';
      else msg = 'Vous venez d\'acquérir ' + this.items + ' billets. Vous pouvez télécharger vos billets.' +
        ' <strong class="underlined">NOTE:</strong> Tous les billets sont actuellement enregistrés sous votre nom. Une autre personne ne' +
        ' peut en faire usage que si vous la partagez. Veuillez vous rendre dans votre espace personnel pour partager ces billets.';
      Swal.fire({
        title: 'Transaction acceptée ',
        html: msg,
        icon: 'success',
        allowEscapeKey: false,
        allowOutsideClick: false,
        focusConfirm: true,
        showCloseButton: false
      });
      if (this.type.toLowerCase() === 'event_sport') this.getEventSportDetails();
      else if (this.type.toLowerCase() === 'transport') this.getTransportTickets()
    } else this.failedStatus();
  }

  ngOnDestroy(): void {
  }

  public getLogoPath(paymentType: string) {
    let src = '../../../assets/images/icons/';
    switch (paymentType.toLowerCase()) {
      case 'orange money':
      case 'om':
        src = src.concat('OM.jpg');
        break;
      case 'wari':
        src.concat('wari.png');
        break;
      case 'joni joni':
      case 'jj':
        src = src.concat('');
        break;
      case 'paypal':
      case 'pp':
        src = src.concat('paypal.png');
        break;
      default:
        src = '';
    }
    return src;
  }

  public download() {
    this.loading = true;
    const type = this.type === 'event_sport' ? 'event' : this.type === 'transport' ? 'transport' : '';
    for (let i = 0; i < this.items; ++i) {
      const data = document.getElementById(type + '-ticket-container' + i);
      console.log(data);
      if (data === null || data === undefined) {
        Swal.fire('Erreur', 'Une erreure s\'est produite lors de la tentative de telechargement des tickets!', 'error')
          .then(res => {
            if (res) this.loading = false;
          });
      } else {
        html2canvas(data as HTMLElement).then(canvas => {
          // Few necessary setting options
          const imgWidth = 2;
          const pageHeight = 2.8;
          const imgHeight = canvas.height * imgWidth / canvas.width;
          const heightLeft = imgHeight;

          const contentDataURL = canvas.toDataURL('image/jpeg');
          const pdf = new jspdf('p', 'in', 'a8'); // A4 size page of PDF
          pdf.addImage(contentDataURL, 'jepg', 0, 0, imgWidth, imgHeight, null, 'slow'); // , imgWidth, imgHeight);
          pdf.save(`${new Date(now()).toISOString()}.pdf`, {returnPromise: true})
            .then(() => {
              this.loading = false;
            }); // Generated PDF
        });
      }
    }
  }

  downloadTicket(type: string, id: number) {
    console.log(type, id);
  }

  private failedStatus() {
    // todo: Prompt retry or cancel
  }

  private getEventSportDetails() {
    this.eventService.getAnEvent(this.idEvent)
      .pipe(this.scavenger.collect(), retry(3))
      .subscribe(
        data => this.event = data,
        error => {
          if (error.status === 404) {
            new SwalConfig().ErrorSwalWithReturn('Invalid ID', 'Cet ID ne correspond à aucun événement')
              .then(res => {
                if (res) this.router.navigate([''])
              });
          } else this.errorHandler.handleError(error);
        }, () => this.getEventTickets());
  }

  private getEventTickets() {
    this.ticketService.getTicketEventByRef(this.idTransaction)
      .pipe(this.scavenger.collect(), retry(3))
      .subscribe(data => {
        if (data.length !== this.items) setTimeout(() => this.getEventTickets(), 1000);
        else {
          this.eventTickets = data;
          this.eventTickets.sort((a, b) => {
            return a.totalPrice < b.totalPrice ? -1 : a.totalPrice > b.totalPrice ? 1 : 0;
          });
          this.loading = false;
        }
      });
  }

  private getTransportTickets() {
    this.ticketService.getTicketTransportByRef(this.idTransaction)
      .pipe(this.scavenger.collect(), retry(3))
      .subscribe(data => {
        if (data.length !== this.items) setTimeout(() => this.getTransportTickets(), 1000);
        else {
          this.transportTickets = data;
          this.loading = false;
        }
      })
  }
}
