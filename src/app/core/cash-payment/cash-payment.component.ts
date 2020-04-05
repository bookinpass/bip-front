import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {EventNominationModel} from '../../models/event-nomination.model';
import {CountryFRJson} from '../../../assets/Country-FR.json';
import {CountryJson} from '../../../assets/Country.json';
import {Scavenger} from '@wishtack/rx-scavenger';
import Swal from 'sweetalert2';
import {CountryCode, isValidNumberForRegion, NationalNumber} from 'libphonenumber-js';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DatePipe} from '@angular/common';
import {CurrencyService} from '../../services/currency.service';
import {addHours} from 'date-fns';
import {retry} from 'rxjs/operators';

@Component({
  selector: 'app-cash-payment',
  templateUrl: './cash-payment.component.html',
  styleUrls: ['./cash-payment.component.css']
})
export class CashPaymentComponent implements OnInit, OnDestroy {

  public loading = false;
  public payer: EventNominationModel;
  public price: number;
  public countries = new CountryFRJson().countries;
  public status = false;
  private scavenger = new Scavenger(this);

  constructor(public dialogRef: MatDialogRef<CashPaymentComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private datePipe: DatePipe,
              private currency: CurrencyService) {
  }

  ngOnInit() {
    this.payer = this.data.payer;
    this.price = this.data.price;
  }

  ngOnDestroy(): void {
  }

  public getCountryDialingCode() {
    return new CountryJson().countries.find(x => x.code.equalIgnoreCase(this.payer.countryCode)).dial_code;
  }

  public cancelRequest() {
    Swal.fire('Annulé', 'Vous avez annulé le processus de paiement', 'info')
      .then(res => {
        if (res) {
          this.data.status = 'canceled';
          this.dialogRef.close(this.status);
        }
      });
  }

  public validateRequest() {
    const orderId = '0d8wq0982qd32w1';
    const ticketId = 'SN892JI7P';
    if (this.checkPhoneNumber()) {
      this.loading = true;
      setTimeout(() => {
        Swal.fire({
          title: 'Cash payment',
          html: '<p class="text-center">Votre reservation a été enregistrée. Un message vous sera envoyé avec le code de rérservation' +
            ' suivant: ' + ticketId + '<br/><br/>Rendez vous dans le point relais le plus proche pour valider votre reservation avant le ' +
            this.datePipe.transform(addHours(new Date(), 5), 'EEEE, dd MMMM yyyy à HH:mm') + '</p>',
          icon: 'success',
          showCancelButton: false,
          confirmButtonText: 'OK',
          allowEnterKey: true,
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then(res => {
          if (res) {
            this.loading = false;
            this.status = true;
            const sms = 'Bonjour, votre réservation a bien été enregistrée. Numéro de votre dossier: ' + ticketId + '. Rendez-vous au' +
              ' point de relai le plus proche.';
            const tel = new CountryJson().countries.find(x => x.code === this.payer.countryCode)
              .dial_code
              .replace('+', '')
              .concat(this.payer.phone);
            this.currency.sendNotificationSMS(tel, sms)
              .pipe(this.scavenger.collect(), retry(2))
              .subscribe(() => this.dialogRef.close(this.status));
          }
        });
      }, 1000);
    } else {
      Swal.fire('Erreur', 'Ce numero de telephone ne represente pas un numero valide pour le ' +
        this.countries.find(x => x.code.equalIgnoreCase(this.payer.countryCode)).name);
    }
  }

  private checkPhoneNumber() {
    return isValidNumberForRegion(this.payer.phone as NationalNumber, this.payer.countryCode as CountryCode);
  }

}
