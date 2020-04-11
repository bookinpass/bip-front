/* tslint:disable:variable-name */
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {UrlConfig} from '../../../assets/url.config';
import {SwalConfig} from '../../../assets/SwalConfig/Swal.config';
import {MatDialog} from '@angular/material/dialog';
import {CashPaymentComponent} from '../cash-payment/cash-payment.component';
import {EventNominationModel} from '../../models/event-nomination.model';
import {Router} from '@angular/router';
import {PaymentRequest} from '../../models/payment-request';

declare const PayExpresse: any;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent {
  @Input() payer: EventNominationModel;
  @Input() paymentRequest: PaymentRequest;
  @Output() loader = new EventEmitter<boolean>();

  constructor(public cashMatDialog: MatDialog,
              private router: Router) {
  }

  public openCashPaymentDialog() {
    const dialog = this.cashMatDialog.open(CashPaymentComponent, {
      width: window.innerWidth > 400 ? '400px' : '360px',
      height: 'max-content',
      hasBackdrop: true,
      disableClose: true,
      closeOnNavigation: true,
      data: {
        payer: new EventNominationModel(),
        price: this.paymentRequest.item_price,
      }
    });
    dialog.afterClosed()
      .subscribe(() => {
        if (status) {
          this.router.navigate(['/']);
        }
      });
  }

  public pay() {
    this.loader.emit(true);
    (new PayExpresse({
      body: JSON.stringify(this.paymentRequest)
    })).withOption({
      requestTokenUrl: `${new UrlConfig().eventHost}/request-payment`,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      prensentationMode: PayExpresse.OPEN_IN_POPUP,
      didReceiveNonSuccessResponse(jsonResponse) {
        if (jsonResponse.message.toString().includes('[')) {
          const x = jsonResponse.message.toString().split('[');
          x[0] = '';
          const y: any = JSON.parse(x.join('').slice(0, x.join('').length - 1).replace(']', ''));
          jsonResponse.error = y.message;
          jsonResponse.message = y.error;
        }
        new SwalConfig().ErrorSwalWithNoReturn(jsonResponse.error, jsonResponse.message);
      }
    }).send();
  }

}
