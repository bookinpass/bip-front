import {Component, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {ICreateOrderRequest, IPayPalConfig} from 'ngx-paypal';
import {CurrencyService} from '../services/currency.service';
import {Scavenger} from '@wishtack/rx-scavenger';
import {GlobalErrorHandlerService} from '../../error/global-error-handler.service';
import {retry} from 'rxjs/operators';
import {TravelerModel} from '../../../models/amadeus/Traveler.model';
import {SwalConfig} from '../../../../assets/SwalConfig/Swal.config';
import {Router} from '@angular/router';
import Swal from 'sweetalert2';
import {CurrencyPipe} from '@angular/common';


@Component({
  selector: 'app-paypal',
  templateUrl: './paypal.component.html',
  styleUrls: ['./paypal.component.css']
})
export class PaypalComponent implements OnInit, OnDestroy {

  @Input() description: string;
  @Input() price: number;
  @Input() travelers: Array<TravelerModel>;

  public payPalConfig?: IPayPalConfig;
  public priceToUsd: string;
  public fromCurrency = 'XOF';
  private toCurrency = 'USD';
  private scavenger = new Scavenger(this);

  constructor(private converter: CurrencyService,
              private router: Router,
              private ngZone: NgZone,
              private currencyPipe: CurrencyPipe) {
  }


  ngOnInit() {
    this.convertAmount();
  }

  ngOnDestroy() {
  }

  private convertAmount() {
    this.converter.getCurrencyConverterRate(this.fromCurrency, this.toCurrency, this.price)
      .pipe(this.scavenger.collect(), retry(6))
      .subscribe((data: any) => {
          this.priceToUsd = (Number(data.rates[this.toCurrency].rate_for_amount).toFixed(2)).toString();
          this.initConfig();
        },
        error => new GlobalErrorHandlerService().handleError(error));
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: this.toCurrency,
      clientId: 'AXw_WRBFaIrxRT_Hu5t-NeqILen5xynZzNOB9iKXhvLtU6__pCJrTEoGQdtEcO&#45;&#45;2TSXlLYvvahC9gVw',
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
                name: 'Votre Billet d\'avion',
                quantity: '1',
                category: 'DIGITAL_GOODS',
                unit_amount: {
                  currency_code: this.toCurrency,
                  value: this.priceToUsd,
                },
                description: this.description,
              }
            ],
          }
        ]
      } as ICreateOrderRequest,
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
        console.log('onApprove - transaction was approved, but not authorized', data, actions);
        actions.order.get().then(details => {
          console.log('onApprove - you can get full order details inside onApprove: ', details);
        });
      },
      onClientAuthorization: (data) => {
        Swal.fire({
          title: 'Done',
          html: 'Votre paiement a ete approuve! <br/>' +
            'Numero de la transaction: ' + data.id + '<br/>' +
            'Montant net payer: ' + this.currencyPipe.transform(this.price, this.fromCurrency, 'symbol-narrow', '1.1-2'),
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
            localStorage.setItem('details', JSON.stringify(data));
            localStorage.setItem('travelers', JSON.stringify(this.travelers));
            this.ngZone.run(() => {
              this.router.navigate(['print', 'flight'], {queryParams: {order: data.id}});
            });
          }
        });
      },
      onCancel: (data, actions) => {
        // console.log('OnCancel', data, actions);
      },
      onError: err => {
        new SwalConfig().ErrorSwalWithNoReturn('Erreur', 'Une Erreure s\'est produite. Veuillez reessayer SVP!');
      },
      onClick: (data, actions) => {
        // console.log('onClick', data, actions);
      },
    };
  }
}
