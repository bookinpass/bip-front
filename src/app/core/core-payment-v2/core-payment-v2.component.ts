import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {IClientAuthorizeCallbackData, ICreateOrderRequest, IPayPalConfig} from 'ngx-paypal';
import {EventNominationModel} from '../../models/event-nomination.model';
import {MatDialog} from '@angular/material/dialog';
import {GeneralConditionComponent} from '../modal/general-condition/general-condition.component';
import {VariableConfig} from '../../../assets/variable.config';
import {CartTicket} from '../../templates/search/event-sport/event-sport-details/event-sport-details.component';
import {CountryFRJson} from '../../../assets/Country-FR.json';
import {AsYouType, CountryCode, getExampleNumber} from 'libphonenumber-js';
import examples from 'libphonenumber-js/examples.mobile.json';
import {CountryJson} from '../../../assets/Country.json';
import {SwalConfig} from '../../../assets/SwalConfig/Swal.config';
import {retry} from 'rxjs/operators';
import {GlobalErrorHandlerService} from '../error/global-error-handler.service';
import Swal from 'sweetalert2';
import {CurrencyService} from '../payments/services/currency.service';
import {Subscription} from 'rxjs';
import {CurrencyPipe} from '@angular/common';
import {EPaymentComponent} from '../payments/e-payment/e-payment.component';
import {SafeUrl} from '@angular/platform-browser';
import {EventModel} from '../../models/event.model';
import {InCashComponent} from "../payments/in-cash/in-cash.component";

export class EPaymentData {
  orderId: string;
  ticketId: string;
  status: string;
  type: string;
  price: number;
  payer: EventNominationModel;
}

@Component({
  selector: 'app-core-payment-v2',
  templateUrl: './core-payment-v2.component.html',
  styleUrls: ['./core-payment-v2.component.css']
})
export class CorePaymentV2Component implements OnInit, OnDestroy {

  @Input() price: number;
  @Input() fromCurrency: string;
  @Input() name: string;
  @Input() description: string;
  @Input() cart: Array<CartTicket>;
  @Input() image: SafeUrl;
  @Input() event: EventModel;

  @Output() goBack = new EventEmitter();
  @Output() persons: EventEmitter<Array<EventNominationModel>> = new EventEmitter<Array<EventNominationModel>>();
  @Output() loading: EventEmitter<boolean> = new EventEmitter<boolean>();

  public paymentData: EPaymentData;
  public currentStep = 1;
  public listOfTicketType = new Array<string>();
  public isEmailValid: boolean;
  public mapError = new Map<number, Set<string>>();
  public loader = false;
  public hasAcceptedCondition = false;
  public countries = new CountryFRJson().countries;
  public listOfPersons = new Array<EventNominationModel>();
  public paymentType = '';
  public payPalConfig: IPayPalConfig;
  public paymentDisplay = [
    {path: '../../../assets/images/icons/cash.jpg', alt: 'en espece', type: 'cash'},
    {path: '../../../assets/images/icons/OM.jpg', alt: 'avec Orange money', type: 'om'},
    {path: '../../../assets/images/icons/paypal.png', alt: 'avec Paypal', type: 'paypal'},
    {path: '../../../assets/images/icons/credit-card.png', alt: 'avec votre carte de credit', type: 'card'},
    {path: '../../../assets/images/icons/wari.png', alt: 'avec Wari', type: 'wari'},
    {path: '../../../assets/images/icons/tigoCash.png', alt: 'avec Tigo Cash', type: 'tigo'}
    // {path: '../../../assets/images/icons/credit.jpg', alt: 'Credit telephonique', type: 'mobile'},
  ];
  private toCurrency = 'USD';
  private subs = new Subscription();
  private hasError = false;
  private priceToUsd: string;
  private paypalDetails: IClientAuthorizeCallbackData;

  constructor(public matDialog: MatDialog,
              public matDialog2: MatDialog,
              public cashMatDialog: MatDialog,
              private converter: CurrencyService,
              private currencyPipe: CurrencyPipe) {
  }

  public static onPaymentError() {
    Swal.fire({
      title: 'Erreur',
      html: 'Votre paiement a échoué! Veuillez vérifier que vous disposez d\'un solde suffisant. Si le problème persiste, veuillez' +
        ' contacter Paypal pour trouver une solution au problème.',
      type: 'error',
      showCancelButton: false,
      confirmButtonText: 'OK',
      allowEnterKey: true,
      allowEscapeKey: false,
      allowOutsideClick: false,
      focusConfirm: true,
      position: 'center'
    });
  }

  ngOnInit() {
    this.setListOfTicketType();
    this.setListOfPersons();
    if (this.listOfTicketType.length === 1) {
      this.listOfPersons[0].ticketType = this.cart[0].type;
    }
    this.openDialog();
  }

  ngOnDestroy(): void {
    if (this.subs !== null) {
      this.subs.unsubscribe();
    }
  }

  public getAssignedTickets() {
    return this.listOfPersons.filter(x => !x.ticketType.equalIgnoreCase('unset') && x.ticketType !== '');
  }

  public getPriceByType(type: string) {
    return this.cart.find(x => x.type.equalIgnoreCase(type)).unitPrice;
  }

  public openDialog(): void {
    const dialog = this.matDialog.open(GeneralConditionComponent, {
      width: 'auto',
      maxWidth: '1000px',
      height: 'auto',
      hasBackdrop: true,
      disableClose: true,
      closeOnNavigation: true
    });
    dialog.afterClosed()
      .subscribe(() => {
        this.hasAcceptedCondition = true;
      });
  }

  public getLogoPath(type: string): string {
    return this.paymentDisplay.find(item => item.type.equalIgnoreCase(type)).path;
  }

  public emailValidityChecker(person: EventNominationModel) {
    if (person.email.length > 0) {
      const x = person.email.match(new VariableConfig().emailRegex);
      this.isEmailValid = x !== null && x !== undefined && x.length > 0;
    } else {
      this.isEmailValid = false;
    }
  }

  public updateListOfTicketType(item: string) {
    if (item !== 'unset') {
      this.listOfTicketType.splice(this.listOfTicketType.indexOf(item), 1);
    }
  }

  public formatNumber(i: number) {
    const x = this.listOfPersons[i];
    x.phone = new AsYouType(x.countryCode as CountryCode).input(x.phone);
  }

  public getTemplate(i: number) {
    const person = this.listOfPersons[i];
    const x = new AsYouType(person.countryCode as CountryCode);
    x.input(getExampleNumber(person.countryCode as CountryCode, examples).nationalNumber.toString());
    return x.getTemplate();
  }

  public isNumberValid(index: number) {
    const x = this.listOfPersons[index];
    // this.isNumberCorrect = isValidNumberForRegion(this.principal.phone, this.principal.countryCode as CountryCode);
  }

  public setNumberPrefix(code: string) {
    return new CountryJson().countries.find(x => x.code.equalIgnoreCase(code)).dial_code;
  }

  public getIndicatif(countryCode: string) {
    return new CountryJson().countries.find(x => x.code.equalIgnoreCase(countryCode)).dial_code;
  }

  public editType(index: number) {
    this.listOfTicketType.push(this.listOfPersons[index].ticketType);
    this.listOfPersons[index].ticketType = '';
  }

  public previousStep() {
    this.goBack.emit(true);
  }

  public checkInformation() {
    this.listOfPersons
      .filter(x => !x.ticketType.equalIgnoreCase('unset'))
      .forEach(x => {
        this.emailValidityChecker(x);
        this.updateMapError(this.listOfPersons.indexOf(x), 'ticketType', x.ticketType.length === 0);
        this.updateMapError(this.listOfPersons.indexOf(x), 'firstName', x.firstName.length === 0);
        this.updateMapError(this.listOfPersons.indexOf(x), 'lastName', x.lastName.length === 0);
        this.updateMapError(this.listOfPersons.indexOf(x), 'email', !this.isEmailValid);
        this.updateMapError(this.listOfPersons.indexOf(x), 'phone', x.phone.length === 0);
      });
    if (this.hasError) {
      new SwalConfig().ErrorSwalWithNoReturn('Erreur', 'Tous les champs sont obligatoires. Veuillez les remplir correctement!');
    } else {
      this.convertAmount();
      this.listOfPersons.filter(x => x.ticketType.equalIgnoreCase('unset')).forEach(x => {
        this.listOfPersons[this.listOfPersons.indexOf(x)] = this.listOfPersons[0];
      });
      this.currentStep = 2;
    }
  }

  public openPaymentDialog(type: string) {
    this.paymentType = type;
    const dialog = this.matDialog2.open(EPaymentComponent, {
      width: window.innerWidth > 420 ? '420px' : '360px',
      height: 'max-content',
      hasBackdrop: true,
      disableClose: true,
      closeOnNavigation: true,
      data: {
        type: this.paymentType,
        payer: this.listOfPersons[0],
        orderId: null,
        status: null,
        price: this.totalPrice(),
      } as EPaymentData
    });
    dialog.afterClosed()
      .subscribe((data: EPaymentData) => {
        this.paymentData = data;
        if (data.status.equalIgnoreCase('succeed')) {
          this.currentStep = 3;
        }
      });
  }

  public openCashPaymentDialog() {
    this.paymentType = 'cash';
    const dialog = this.cashMatDialog.open(InCashComponent, {
      width: window.innerWidth > 400 ? '400px' : '360px',
      height: 'max-content',
      hasBackdrop: true,
      disableClose: true,
      closeOnNavigation: true,
      data: {
        type: this.paymentType,
        payer: this.listOfPersons[0],
        orderId: null,
        status: null,
        price: this.totalPrice(),
      } as EPaymentData
    });
    dialog.afterClosed()
      .subscribe((data: EPaymentData) => {
        this.paymentData = data;
        // todo: save record to background
      });
  }

  private setListOfTicketType() {
    this.cart.forEach(x => {
      for (let i = 0; i < x.amount; ++i) {
        this.listOfTicketType.push(x.type);
      }
    });
  }

  private setListOfPersons() {
    let totalTickets = 0;
    this.cart.map(x => Number(x.amount)).forEach(x => totalTickets = Number(totalTickets) + Number(x));
    for (let i = 0; i < totalTickets; i++) {
      this.listOfPersons.push(new EventNominationModel());
      this.mapError.set(i, new Set<string>());
    }
  }

  private updateMapError(key: number, value: string, adding: boolean) {
    const set = this.mapError.get(key);
    this.hasError = adding;
    adding ? set.add(value) : set.delete(value);
    this.mapError.set(key, set);
  }

  private convertAmount() {
    this.subs = this.converter.getCurrencyConverterRate(this.fromCurrency, this.toCurrency, this.price)
      .pipe(retry(2))
      .subscribe((data: any) => {
          this.priceToUsd = (Number(data.rates[this.toCurrency].rate_for_amount).toFixed(2)).toString();
          this.initConfig();
        }, error => new GlobalErrorHandlerService().handleError(error)
      );
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: this.toCurrency,
      clientId: 'AXw_WRBFaIrxRT_Hu5t-NeqILen5xynZzNOB9iKXhvLtU6__pCJrTEoGQdtEcO&#45;&#45;2TSXlLYvvahC9gVw',
      // tslint:disable-next-line:no-angle-bracket-type-assertion
      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: this.toCurrency,
              value: this.priceToUsd,
              breakdown: {
                item_total: {
                  currency_code: this.toCurrency,
                  value: this.priceToUsd
                }
              }
            },
            items: [
              {
                name: this.name,
                quantity: '1',
                category: 'DIGITAL_GOODS',
                unit_amount: {
                  currency_code: this.toCurrency,
                  value: this.priceToUsd,
                },
                description: this.description,
              }
            ]
          }
        ]
      },
      advanced: {
        commit: 'true'
      },
      style: {
        color: 'blue',
        shape: 'pill',
        label: 'pay',
        size: 'responsive'
      },
      onApprove: (data, actions) => {
        console.log('onApprove - transaction was approved, but not authorized');
        console.log(data);
        console.log(actions);
        actions.order.get().then(details => {
          console.log('onApprove - you can get full order details inside onApprove');
          console.log(details);
        });
      },
      onClientAuthorization: (data) => {
        this.loader = false;
        this.onPaymentSucceed(data);
      },
      onCancel: (data, actions) => {
        this.loader = false;
        Swal.fire('Info', 'La transaction a ete annulee', 'info');
      },
      onError: () => {
        this.loader = false;
        CorePaymentV2Component.onPaymentError();
      },
      onClick: _ => {
        this.loader = true;
      }
    };
  }

  private onPaymentSucceed(success: IClientAuthorizeCallbackData) {
    this.paypalDetails = success;
    Swal.fire({
      title: 'Done',
      html: 'Votre paiement a été approuvé! <br/>' +
        'Numéro de la transaction: ' + this.paypalDetails.id + '<br/>' +
        'Montant net payer: ' + this.currencyPipe.transform(this.totalPrice(), this.fromCurrency, 'symbol-narrow', '1.1-2'),
      type: 'success',
      showCancelButton: false,
      confirmButtonText: 'OK',
      allowEnterKey: true,
      allowEscapeKey: false,
      allowOutsideClick: false,
      focusConfirm: true,
      position: 'center'
    }).then(res => {
      if (res) {
        this.currentStep = 3;
      }
    });
  }

  private totalPrice = () => {
    let price = 0;
    this.cart.map(x => x.totalPrice)
      .forEach(x => price = Number(price) + Number(x));
    return price;
  }
}
