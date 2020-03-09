import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
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
import {Subscription} from 'rxjs';
import {SafeUrl} from '@angular/platform-browser';
import {EventModel} from '../../models/event.model';
import {InCashComponent} from '../payments/in-cash/in-cash.component';
import {UrlConfig} from '../../../assets/url.config';

declare const PayExpresse: any;

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
  private url = new UrlConfig().eventHost;
  private subs = new Subscription();
  private hasError = false;

  constructor(public matDialog: MatDialog,
              public cashMatDialog: MatDialog) {
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
      this.listOfPersons.filter(x => x.ticketType.equalIgnoreCase('unset')).forEach(x => {
        this.listOfPersons[this.listOfPersons.indexOf(x)] = this.listOfPersons[0];
      });
      this.currentStep = 2;
    }
  }

  public openCashPaymentDialog() {
    const dialog = this.cashMatDialog.open(InCashComponent, {
      width: window.innerWidth > 400 ? '400px' : '360px',
      height: 'max-content',
      hasBackdrop: true,
      disableClose: true,
      closeOnNavigation: true,
      data: {
        type: 'cash',
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

  public pay() {
    const name = this.name;
    const id = '';
    (new PayExpresse({
      item_id: id
    })).withOption({
      requestTokenUrl: `${this.url}/request-payment?name=${name}&price=${this.price}.0&order=${this.description}`,
      method: 'POST',
      headers: {
        Accept: 'application/json'
      },
      prensentationMode: PayExpresse.OPEN_IN_POPUP,
      // tslint:disable-next-line:variable-name
      didPopupClosed(is_completed, success_url, cancel_url) {
        console.log("done");
        if (is_completed) {
          this.currentStep = 3;
        }
      },
      willGetToken() {
        console.log('Je me prepare a obtenir un token');
      },
      didGetToken(token, redirectUrl) {
        console.log('Mon token est : ' + token + ' et url est ' + redirectUrl);
      },
      didReceiveError(error) {
        console.log(error);
      },
      didReceiveNonSuccessResponse(jsonResponse) {
        console.log('non success response ', jsonResponse);
        alert(jsonResponse.errors);
      }
    }).send();
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

  private totalPrice = () => {
    let price = 0;
    this.cart.map(x => x.totalPrice)
      .forEach(x => price = Number(price) + Number(x));
    return price;
  }
}
