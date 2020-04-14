import {Component, OnDestroy, OnInit} from '@angular/core';
import {Scavenger} from '@wishtack/rx-scavenger';
import {ActivatedRoute, Router} from '@angular/router';
import {EventService} from '../../services/event/event.service';
import {GlobalErrorHandlerService} from '../../core/error/global-error-handler.service';
import {retry} from 'rxjs/operators';
import {EventModel} from '../../models/event.model';
import {Location} from '@angular/common';
import {SwalConfig} from '../../../assets/SwalConfig/Swal.config';
import {ImageService} from '../../services/images/image.service';
import {DomSanitizer} from '@angular/platform-browser';
import {PricingModel} from '../../models/pricing.model';
import Swal from 'sweetalert2';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ValidPhone} from '../../core/validators/CustomValidators';
import {AuthService} from '../../services/authentication/auth.service';
import {EventNominationModel} from '../../models/event-nomination.model';
import {CountryJson} from '../../../assets/Country.json';
import {CountryCode, formatIncompletePhoneNumber} from 'libphonenumber-js';
import {VariableConfig} from '../../../assets/variable.config';
import {MatDialog} from '@angular/material/dialog';
import {GeneralConditionComponent} from '../../core/modal/general-condition/general-condition.component';
import {PayExpressParams} from '../../models/pay-express-params';
import {UrlConfig} from '../../../assets/url.config';

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
  public cartTicket = new CartTicket();
  public cart = new Array<CartTicket>();
  public id: string;
  public formGroup: FormGroup;
  public submitted = false;
  public countries = new CountryJson().countries;
  public captachaKey = new VariableConfig().captachaKey;
  public payExpressParam: PayExpressParams;
  private urlConfig = new UrlConfig();
  private scavenger = new Scavenger(this);

  constructor(private eventService: EventService,
              private imageService: ImageService,
              private sanitizer: DomSanitizer,
              private authService: AuthService,
              private fb: FormBuilder,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private errorHandler: GlobalErrorHandlerService,
              private location: Location,
              private dialog: MatDialog) {
  }

  get f() {
    return this.formGroup.controls;
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.url[this.activatedRoute.snapshot.url.length - 1].path;
    this.getEvent();
  }

  ngOnDestroy(): void {
  }

  public getPayExpressParam(): PayExpressParams {
    const req = new PayExpressParams();
    req.item_name = 'Ticket '.concat(this.event.designation);
    req.command_name = this.event.description === null || this.event.description === undefined ? '' : this.event.description;
    req.ipn_url = this.urlConfig.mainHost.concat(this.urlConfig.payExpressIpn);
    req.item_price = this.cartTotalPrice();
    req.cancel_url = `${location.origin}/transaction?type=event_sport&id=${this.id}&items=${this.cartTotalTicket}`;
    req.success_url = `${location.origin}/transaction?type=event_sport&id=${this.id}&items=${this.cartTotalTicket()}`;
    const tik = new Array<string>();
    this.cart.forEach(item => tik.push(item.type.toLowerCase() + '#' + item.amount.toString(10)));
    req.custom_field = JSON.stringify({
      id: this.id, type: 'event', tickets: tik.join('@').toString(),
      firstName: this.f.firstName.value, lastName: this.f.lastName.value
    });
    return req;
  }

  public getDialCode() {
    return this.countries.find(x => x.code === this.f.countryCode.value).dial_code;
  }

  public formatNumber() {
    return formatIncompletePhoneNumber(this.f.telephone.value, this.f.countryCode.value.toUpperCase() as CountryCode);
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

  public onSubmit() {
    this.submitted = true;
    if (this.formGroup.invalid) return;
    this.openConditionModal();
    this.payExpressParam = this.getPayExpressParam();
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

  public async resolvedCaptcha(response: string) {
    const resp = await this.authService.validateCaptacha(response);
    resp.pipe(this.scavenger.collect())
      .subscribe(data => {
        if (!data)
          Swal.fire('Error', 'Le captcha a expire. Veuillez reessayer SVP!', 'error')
            .then(res => {
              if (res) {
                location.reload();
              }
            });
        else setTimeout(() => this.f.captcha.setValue(true), 500);
      }, error => console.log(error));
  }

  public itemExistInCart(item: PricingModel) {
    return this.cart.filter(x => x.type.equalIgnoreCase(item.description)).length > 0;
  }

  public previousStep() {
    this.currentStep = this.currentStep - 1;
  }

  private openConditionModal() {
    const dlg = this.dialog.open(GeneralConditionComponent, {
      width: window.innerWidth > 768 ? '800px' : window.innerWidth / 2 + 'px',
      // height: 'auto',
      // height: window.innerHeight > 700 ? window.innerHeight - 40 + 'px' : window.innerHeight - 20 + 'px',
      closeOnNavigation: true,
      hasBackdrop: true,
      disableClose: true,
      autoFocus: false,
      direction: 'ltr'
    });
    dlg.afterClosed().subscribe(() => {
      // todo: store local storage
      //
      this.currentStep = 3;
    });
  }

  // private getImages() {
  //   this.imageService.getImage('event', this.id)
  //     .pipe(this.scavenger.collect(), retry(3))
  //     .subscribe(data => {
  //       const x: any = data.body;
  //       this.eventImage = this.sanitizer.bypassSecurityTrustUrl(x.content.toString());
  //     }, _ => this.eventImage = this.sanitizer.bypassSecurityTrustUrl(new ImageBase64().noImageFR));
  // }

  private getEvent() {
    this.eventService.getAnEvent(this.id)
      .pipe(this.scavenger.collect(), retry(3))
      .subscribe(
        data => {
          this.event = data;
          this.currentStep = 1;
          this.loading = false;
          this.setForm();
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

  private setForm() {
    const nom = new EventNominationModel();
    if (this.authService.isLoggedIn()) {
      const model = this.authService.getCurrentUser();
      nom.firstName = model.firstName;
      nom.lastName = model.lastName;
      nom.telephone = model.telephone;
      nom.countryCode = model.countryCode;
    }
    this.formGroup = this.fb.group({
      firstName: [nom.firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [nom.lastName, [Validators.required, Validators.minLength(2)]],
      countryCode: [nom.countryCode, [Validators.required]],
      telephone: [nom.telephone, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      captcha: [null, Validators.requiredTrue]
    }, {
      validator: ValidPhone('countryCode', 'telephone')
    });
  }

}
