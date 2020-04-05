import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CountryJson} from '../../../../assets/Country.json';
import Swal from 'sweetalert2';
import {CountryCode, isValidNumberForRegion} from 'libphonenumber-js';
import {CurrencyPipe} from '@angular/common';
import {EPaymentData} from '../../../templates/search/boat/boat-result/boat-result.component';

@Component({
    selector: 'app-e-payment',
    templateUrl: './e-payment.component.html',
    styleUrls: ['./e-payment.component.css']
})
export class EPaymentComponent implements OnInit {

    public paymentData: EPaymentData;
    public authorizationCode = '';
    public loading = false;
    private paymentDisplay = [
        {path: '../../../assets/images/icons/paypal.png', alt: 'avec Paypal', type: 'paypal'},
        {path: '../../../assets/images/icons/credit-card.png', alt: 'avec votre carte de credit', type: 'card'},
        {path: '../../../assets/images/icons/OM.jpg', alt: 'avec Orange money', type: 'om'},
        {path: '../../../assets/images/icons/wari.png', alt: 'avec Wari', type: 'wari'},
        {path: '../../../assets/images/icons/tigoCash.png', alt: 'avec Tigo Cash', type: 'tigo'},
        {path: '../../../assets/images/icons/cash.png', alt: 'en espece', type: 'cash'},
    ];

    constructor(public dialogRef: MatDialogRef<EPaymentComponent>,
                @Inject(MAT_DIALOG_DATA) public data: EPaymentData,
                private currencyPipe: CurrencyPipe) {
    }

    ngOnInit() {
        this.paymentData = this.data;
    }

    public getPaymentDisplay() {
        return this.paymentDisplay.find(x => x.type.equalIgnoreCase(this.paymentData.type));
    }

    public validateRequest() {
        this.paymentData.orderId = '0d8wq0982qd32w1';
        this.paymentData.ticketId = 'SN892JI7P';
        if (this.checkForm()) {
            this.loading = true;
            setTimeout(() => {
                Swal.fire({
                    title: 'Réussi',
                    html: 'Votre paiement a été accepté.<br/> ID transaction: ' + this.paymentData.orderId + '<br/> Net Payé: ' +
                        this.currencyPipe.transform(this.paymentData.price, 'XOF', 'symbol-narrow', '1.1-2'),
                    icon: 'success',
                    showCloseButton: false,
                    showCancelButton: false,
                    showConfirmButton: true,
                    confirmButtonColor: 'primary',
                    confirmButtonText: 'Finaliser',
                    focusConfirm: true,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: true,
                }).then(res => {
                    if (res) {
                        this.loading = false;
                        this.paymentData.status = 'succeed';
                        this.dialogRef.close(this.paymentData);
                    }
                });
            }, 2500);
        } else {
            Swal.fire('Erreur', 'Veuillez remplir tous les champs du formulaire avant de procéder a la validation');
        }
    }

    public cancelRequest() {
        Swal.fire('Annulé', 'Vous avez annulé le processus de paiement', 'info')
            .then(res => {
                if (res) {
                    this.data.status = 'canceled';
                    this.dialogRef.close(this.data);
                }
            });
    }

    public getCountryDialingCode() {
        return new CountryJson().countries.find(x => x.code.equalIgnoreCase(this.paymentData.payer.countryCode)).dial_code;
    }

    private checkForm() {
        return isValidNumberForRegion(this.paymentData.payer.phone, this.paymentData.payer.countryCode as CountryCode)
            && this.authorizationCode.length === 6;
    }
}
