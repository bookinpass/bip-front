import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CurrencyService} from '../payments/services/currency.service';
import {IClientAuthorizeCallbackData, ICreateOrderRequest, IPayPalConfig} from 'ngx-paypal';
import {Scavenger} from '@wishtack/rx-scavenger';
import {retry} from 'rxjs/operators';
import {GlobalErrorHandlerService} from '../error/global-error-handler.service';
import Swal from 'sweetalert2';
import {EventNominationModel} from '../../models/event-nomination.model';
import {VariableConfig} from '../../../assets/variable.config';
import {MatDialog} from '@angular/material/dialog';
import {GeneralConditionComponent} from '../modal/general-condition/general-condition.component';
import {EPaymentComponent} from '../payments/e-payment/e-payment.component';
import {InCashComponent} from '../payments/in-cash/in-cash.component';
import {EPaymentData} from '../core-payment-v2/core-payment-v2.component';

@Component({
  selector: 'app-core-payment',
  templateUrl: './core-payment.component.html',
  styleUrls: ['./core-payment.component.css']
})
export class CorePaymentComponent implements OnInit, OnDestroy {

  @Input() price: number;
  @Input() fromCurrency: string | 'XOF';
  @Input() name: string;
  @Input() quantity: string;
  @Input() description: string;
  @Input() numberOfOtherTravelers: number;
  @Output() transactionDetailsEmitter: EventEmitter<IClientAuthorizeCallbackData> = new EventEmitter<IClientAuthorizeCallbackData>();
  @Output() transactionErrorEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() loading: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() updateStep = new EventEmitter<number>();
  @Output() transactionDetails = new EventEmitter<EPaymentData>();

  public principalNomination = new EventNominationModel();
  public otherTravelerNominations = new Array<EventNominationModel>();
  public isEmailValid: boolean;
  public mapError = new Set<string>();
  public loader = false;
  public hasAcceptedCondition = false;
  public payPalConfig?: IPayPalConfig;
  public priceToUsd: string;
  public paymentType: string;
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
  private scavenger = new Scavenger(this);

  constructor(private converter: CurrencyService,
              public matDialog: MatDialog,
              public matDialog2: MatDialog,
              public cashMatDialog: MatDialog) {
  }

  ngOnInit() {
    this.convertAmount();
    let i = this.numberOfOtherTravelers;
    while (i > 0) {
      this.otherTravelerNominations.push(new EventNominationModel());
      --i;
    }
  }

  ngOnDestroy(): void {
  }

  public openDialog(): void {
    this.matDialog.open(GeneralConditionComponent, {
      width: window.innerWidth > 768 ? '800px' : window.innerWidth / 2 + 'px',
      height: window.innerHeight > 700 ? window.innerHeight - 40 + 'px' : window.innerHeight - 20 + 'px'
    });
  }

  public emailValidityChecker() {
    if (this.principalNomination.email.length > 0) {
      const x = this.principalNomination.email.match(new VariableConfig().emailRegex);
      this.isEmailValid = x !== null && x !== undefined && x.length > 0;
    } else {
      this.isEmailValid = false;
    }
  }

  public checkCondition() {
    if (this.checkInformation()) {
      if (this.paymentType === undefined) {
        this.convertAmount();
      }
      this.hasAcceptedCondition = true;
    } else {
      this.paymentType = undefined;
      this.hasAcceptedCondition = false;
      $('#condition-checker').prop('checked', false);
      Swal.fire('Erreur', 'Veuillez corriger les champs en rouge avant de pouvoir procedé au paiement.', 'error');
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
        payer: this.principalNomination,
        orderId: null,
        status: null,
        price: this.price,
      } as EPaymentData
    });
    dialog.afterClosed()
      .subscribe((data: EPaymentData) => {
        this.transactionDetails.emit(data);
        if (data.status.equalIgnoreCase('succeed')) {
          this.updateStep.emit(3);
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
        payer: this.principalNomination,
        orderId: null,
        status: null,
        price: this.price,
      } as EPaymentData
    });
    dialog.afterClosed()
      .subscribe((data: EPaymentData) => {
        this.transactionDetails.emit(data);
        this.updateStep.emit(3);
        // todo: save record to background
      });
  }


  private checkInformation(): boolean {
    this.emailValidityChecker();
    this.principalNomination.firstName.length === 0 ? this.mapError.add('firstName') : this.mapError.delete('firstName');
    this.principalNomination.lastName.length === 0 ? this.mapError.add('lastName') : this.mapError.delete('lastName');
    !this.isEmailValid ? this.mapError.add('email') : this.mapError.delete('email');
    this.principalNomination.phone.length === 0 ? this.mapError.add('phone') : this.mapError.delete('phone');
    this.principalNomination.idType.length === 0 ? this.mapError.add('idType') : this.mapError.delete('idType');
    this.principalNomination.idNumber.length === 0 ? this.mapError.add('idNumber') : this.mapError.delete('idNumber');
    return this.mapError.size === 0;
  }

  private convertAmount() {
    this.converter.getCurrencyConverterRate(this.fromCurrency, this.toCurrency, this.price)
      .pipe(this.scavenger.collect(), retry(2))
      .subscribe((data: any) => {
          this.priceToUsd = (Number(data.rates[this.toCurrency].rate_for_amount).toFixed(2)).toString();
          this.initConfig();
        },
        error => new GlobalErrorHandlerService().handleError(error)
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
                quantity: this.quantity,
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
        this.transactionDetailsEmitter.emit(data);
      },
      onCancel: (data, actions) => {
        this.loader = false;
        Swal.fire('Info', 'La transaction a ete annulee', 'info');
      },
      onError: error => {
        this.loader = false;
        this.transactionErrorEmitter.emit(error);
      },
      onClick: _ => {
        this.loader = true;
      }
    };
  }
}
