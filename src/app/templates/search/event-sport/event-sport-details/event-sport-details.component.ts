import {Component, OnDestroy, OnInit} from '@angular/core';
import {Scavenger} from '@wishtack/rx-scavenger';
import {ActivatedRoute, Router} from '@angular/router';
import {EventService} from '../../../../services/event/event.service';
import {GlobalErrorHandlerService} from '../../../../core/error/global-error-handler.service';
import {retry} from 'rxjs/operators';
import {EventModel} from '../../../../models/event.model';
import {Location} from '@angular/common';
import {SwalConfig} from '../../../../../assets/SwalConfig/Swal.config';
import {ImageService} from '../../../../services/images/image.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ImageBase64} from '../../../../../assets/images/base64/image.base64';
import {PricingModel} from '../../../../models/pricing.model';
import Swal from 'sweetalert2';
import {EventNominationModel} from '../../../../models/event-nomination.model';
import {VariableConfig} from '../../../../../assets/variable.config';

export class CartTicket {
  type = '';
  amount = 0;
  unitPrice = 0;
  totalPrice = this.amount * this.unitPrice;
}

@Component({
  selector: 'app-event-ticket-details',
  templateUrl: './event-sport-details.component.html',
  styleUrls: ['./event-sport-details.component.css']
})
export class EventSportDetailsComponent implements OnInit, OnDestroy {

  public loading = true;
  public event: EventModel;
  public currentStep = 0;
  public eventImage;
  public cartTicket = new CartTicket();
  public cart = new Array<CartTicket>();
  public persons: Array<EventNominationModel>;
  public currency = new VariableConfig().currencyCode;
  private id: string;
  private scavenger = new Scavenger(this);

  constructor(private eventService: EventService,
              private imageService: ImageService,
              private sanitizer: DomSanitizer,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private errorHandler: GlobalErrorHandlerService,
              private location: Location) {
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.url[this.activatedRoute.snapshot.url.length - 1].path;
    this.getEvent();
    this.getImage();
  }

  ngOnDestroy(): void {
  }

  public sortPricing(): Array<PricingModel> {
    return this.event.tarification.sort((x, y) => {
      return x.price > y.price ? 1 : x.price < y.price ? -1 : 0;
    });
  }

  public filteredPricing(): Array<PricingModel> {
    return this.sortPricing().filter(x =>
      x.remainingTicket ? x.remainingTicket : x.soldTicket ? x.totalTickets - x.soldTicket > 0 : x.totalTickets
    );
  }

  public updateSelectedTicketType() {
    if (this.cartTicket.type === '') {
      this.cartTicket.unitPrice = 0;
    } else {
      const pricing = this.event.tarification.find(x => x.description.equalIgnoreCase(this.cartTicket.type));
      this.cartTicket.type = pricing.description;
      this.cartTicket.unitPrice = pricing.price;
    }
  }

  public addToCart() {
    if ((Number(this.cartTotalTicket()) + Number(this.cartTicket.amount)) > 5) {
      Swal.fire('Erreur', 'Vous ne pouvez choisir plus de 5 tickets a la fois!', 'error');
    } else {
      this.cart.push(this.cartTicket);
      this.cart.sort((x, y) => {
        return x.type > y.type ? 1 : x.type < y.type ? -1 : 0;
      });
      this.cartTicket = new CartTicket();
    }
  }

  public cartTotalPrice(): number {
    let x = 0;
    this.cart.map(p => p.totalPrice).forEach(p => x += p);
    return x;
  }

  public cartTotalTicket(): number {
    let x = 0;
    this.cart.map(p => p.amount).forEach(p => x = Number(x) + Number(p));
    return x;
  }

  public editItem(item: CartTicket) {
    this.cart.splice(this.cart.indexOf(item), 1);
    this.cartTicket = item;
  }

  public deleteItem(item: CartTicket) {
    Swal.fire({
      title: 'Suppression',
      text: 'Êtes vous sûr de vouloir supprimer cette élément ?',
      icon: 'question',
      showCancelButton: true,
      showCloseButton: true,
      cancelButtonText: 'Non',
      confirmButtonText: 'Oui',
      confirmButtonColor: 'primary',
      cancelButtonColor: 'danger',
      focusCancel: true
    }).then(data => {
      if (data.value) {
        this.cart.splice(this.cart.indexOf(item), 1);
        Swal.fire('Supprimer', `Ticket ${item.type} supprimé!`, 'info');
      } else {
        Swal.fire('Annuler', 'La suppression a été annulé!', 'info');
      }
    });
  }

  public resolvedCaptcha($event: string) {
    if ($event === null) {
      Swal.fire('Error', 'Le captcha a expire. Veuillez reessayer SVP!', 'error')
        .then(res => {
          if (res) {
            location.reload();
          }
        });
    } else {
      setTimeout(() => this.currentStep = 2, 700);
    }
  }

  public itemExistInCart(item: PricingModel) {
    return this.cart.filter(x => x.type.equalIgnoreCase(item.description)).length > 0;
  }

  public previousStep() {
    this.currentStep = this.currentStep - 1;
  }

  private getImage() {
    this.eventImage = this.sanitizer.bypassSecurityTrustUrl(`../../../assets/images/event/${this.id}.jpg`);
  }

  private getImages() {
    this.imageService.getImage('event', this.id)
      .pipe(this.scavenger.collect(), retry(3))
      .subscribe(data => {
        const x: any = data.body;
        this.eventImage = this.sanitizer.bypassSecurityTrustUrl(x.content.toString());
      }, _ => this.eventImage = this.sanitizer.bypassSecurityTrustUrl(new ImageBase64().noImageFR));
  }

  private getEvent() {
    this.eventService.getAnEvent(this.id)
      .pipe(this.scavenger.collect(), retry(3))
      .subscribe(
        data => {
          this.event = data;
          this.currentStep = 1;
          this.loading = false;
        },
        error => {
          if (error.status === 404) {
            new SwalConfig().ErrorSwalWithReturn('Invalid ID', 'Cet ID ne correspond à aucun événement')
              .then(res => {
                if (res) {
                  this.location.back();
                }
              });
          } else {
            this.errorHandler.handleError(error);
          }
        });
  }
}
