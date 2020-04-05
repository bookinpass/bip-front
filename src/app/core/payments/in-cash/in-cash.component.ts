import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DatePipe} from '@angular/common';
import {EPaymentComponent} from '../e-payment/e-payment.component';
import {CountryFRJson} from '../../../../assets/Country-FR.json';
import {CountryJson} from '../../../../assets/Country.json';
import Swal from 'sweetalert2';
import {CountryCode, isValidNumberForRegion, NationalNumber} from 'libphonenumber-js';
import {addHours} from 'date-fns';
import {EPaymentData} from '../../../templates/search/boat/boat-result/boat-result.component';

@Component({
  selector: 'app-in-cash',
  templateUrl: './in-cash.component.html',
  styleUrls: ['./in-cash.component.css']
})
export class InCashComponent implements OnInit {

  public countries = new CountryFRJson().countries;
  public paymentData: EPaymentData;
  public loading = false;

  constructor(public dialogRef: MatDialogRef<EPaymentComponent>,
              @Inject(MAT_DIALOG_DATA) public data: EPaymentData,
              private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.paymentData = this.data;
  }

  public getCountryDialingCode() {
    return new CountryJson().countries.find(x => x.code.equalIgnoreCase(this.paymentData.payer.countryCode)).dial_code;
  }

  public validateRequest() {
    this.paymentData.orderId = '0d8wq0982qd32w1';
    this.paymentData.ticketId = 'SN892JI7P';
    if (this.checkPhoneNumber()) {
      this.loading = true;
      setTimeout(() => {
        Swal.fire({
          title: 'Cash payment',
          html: '<p class="text-center">Votre reservation a été enregistrée. Un message vous sera envoyé avec le code de réservation' +
            ' suivant: ' + this.paymentData.ticketId + '<br/><br/>Rendez vous dans le point relais le plus proche pour valider votre ' +
            'reservation avant le ' + this.datePipe.transform(addHours(new Date(), 5), 'EEEE, dd MMMM yyyy à HH:mm') + '</p>',
          icon: 'success',
          showCancelButton: false,
          confirmButtonText: 'OK',
          allowEnterKey: true,
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then(res => {
          if (res) {
            this.loading = false;
            this.paymentData.status = 'succeed';
            this.dialogRef.close(this.paymentData);
          }
        });
      }, 1000);
    } else {
      Swal.fire('Erreur', 'Ce numero de telephone ne represente pas un numero valide pour le ' +
        this.countries.find(x => x.code.equalIgnoreCase(this.paymentData.payer.countryCode)).name);
    }
  }

  public cancelRequest() {
    Swal.fire('Annulé', 'Vous avez annulé le processus de paiement', 'info')
      .then(res => {
        if (res) {
          this.data.status = 'canceled';
          this.dialogRef.close(this.paymentData);
        }
      });
  }

  private checkPhoneNumber() {
    return isValidNumberForRegion(this.paymentData.payer.phone as NationalNumber, this.paymentData.payer.countryCode as CountryCode);
  }
}
