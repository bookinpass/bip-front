import {Component, OnDestroy, OnInit} from '@angular/core';
import {FlightOfferModel} from '../../models/amadeus/flight-offer.model';
import Swal from 'sweetalert2';
import {Router} from '@angular/router';
import {AmadeusService} from '../../services/amadeus/amadeus.service';
import {Scavenger} from '@wishtack/rx-scavenger';
import {FlightOfferPricingResponseModel} from '../../models/amadeus/flight-offer-pricing-response.model';
import {ContactModel, DocumentModel, TravelerModel} from '../../models/amadeus/traveler.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MustMatch, ValidPhone} from '../../core/validators/CustomValidators';
import {CountryJson} from '../../../assets/Country.json';
import {MatDialog} from '@angular/material/dialog';
import {DatePipe} from '@angular/common';
import {addMinutes, isAfter, isBefore, isSameDay, parseISO, subYears} from 'date-fns';
import {retry} from 'rxjs/operators';
import {ConditionsComponent} from './conditions/conditions.component';
import {CountryCode, formatIncompletePhoneNumber} from 'libphonenumber-js';
import {PaygateService} from '../../services/paygate.service';
import {CookieService} from 'ngx-cookie-service';
import {UrlConfig} from '../../../assets/url.config';
import {FlightCreateOrderResponseModel} from '../../models/amadeus/flight-create-order-response.model';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit, OnDestroy {

  public loading = true;
  public submitted = false;
  public contactForm: FormGroup;
  public response: FlightOfferPricingResponseModel;
  public travelers: TravelerModel[] = [];
  public countries = new CountryJson().countries;
  private contact: ContactModel;
  private config = new UrlConfig();
  private flightOfferModel: FlightOfferModel;
  private scavenger = new Scavenger(this);

  constructor(private router: Router,
              private amadeusService: AmadeusService,
              private paygateService: PaygateService,
              private cookieService: CookieService,
              private fb: FormBuilder,
              private dialog: MatDialog,
              private datePipe: DatePipe) {
  }

  get f() {
    return this.contactForm.controls;
  }

  async ngOnInit(): Promise<void> {
    this.setContactForm();
    await this.amadeusService.setToken();
    //
    // this.response = JSON.parse(sessionStorage.getItem('ticket')) as FlightOfferPricingResponseModel;
    // if (this.response !== null && this.response !== undefined) {
    //   this.response.data.flightOffers[0].travelerPricings.forEach(x => {
    //     const model: TravelerModel = {
    //       gender: 'MALE', name: {lastName: '', firstName: '', middleName: ''}, id: x.travelerId, dateOfBirth: ''
    //     };
    //     if (Number(x.travelerId) === 1) {
    //       model.documents = [{
    //         documentType: 'IDENTITY_CARD', // VISA, PASSPORT, IDENTITY_CARD
    //         holder: true, issuanceCountry: 'sn', issuanceDate: '', expiryDate: '', nationality: '', number: '', birthCountry: ''
    //       } as DocumentModel];
    //     }
    //     this.travelers.push(model);
    //   });
    //   this.loading = false;
    // } else {
    // }
    this.flightOfferModel = JSON.parse(sessionStorage.getItem('offer')) as FlightOfferModel;
    if (this.flightOfferModel === null || this.flightOfferModel === undefined) {
      this.noOfferFound();
    } else {
      this.getFlightOfferPrice();
    }
  }

  ngOnDestroy() {
    this.scavenger.unsubscribe();
  }

  public openConditionDialog = (): void => {
    if (this.checkInformation()) {
      const dialog = this.dialog.open(ConditionsComponent, {
        width: 'auto', maxWidth: '90vw', height: 'auto', maxHeight: '90vh', hasBackdrop: true, disableClose: true, closeOnNavigation: true,
        id: 'flight-conditions-dialog', data: {conditions: this.response.included['detailed-fare-rules']}
      });
      dialog.afterClosed().subscribe(_ => $('#paymentButton')[0].classList.remove('disabled'));
    }
  }

  public formatNumber = () =>
    this.f.phoneNumber.setValue(formatIncompletePhoneNumber(this.f.phoneNumber.value, this.f.flag.value.toUpperCase() as CountryCode))

  public updateFlag = () =>
    this.f.flag.setValue(this.countries.find(x => x.dial_code === this.f.countryCallingCode.value).code.toLowerCase())

  public async proceedToPayment() {
    const loaderMessage = $('#loaderMessage')[0];
    loaderMessage.innerHTML = 'Création de votre réservation...';
    this.loading = true;
    sessionStorage.setItem('flag', 'flight');
    const orderData = await this.createFlightTicketOrder();
    loaderMessage.innerHTML = 'Création de votre transaction...';
    const value = this.createPaygateTransactionData(orderData);
    loaderMessage.innerHTML = 'Sécurisation de votre connexion...';
    const url = await this.createTransaction(value);
    loaderMessage.innerHTML = 'Vous allez être redirigé \nvers votre page de paiement...';
    setTimeout(() => window.open(url, '_self'), 2500);
  }

  private async createFlightTicketOrder(): Promise<FlightCreateOrderResponseModel> {
    const data = {
      data: {
        type: 'flight-order',
        flightOffers: this.response.data.flightOffers,
        travelers: this.travelers,
        remarks: {
          general: [
            {
              subType: 'GENERAL_MISCELLANEOUS',
              text: 'ONLINE BOOKING FROM BOOKINPASS'
            }
          ]
        },
        ticketingAgreement: {
          option: 'DELAY_TO_CANCEL',
          delay: '1D'
        },
        contacts: [this.contact]
      }
    };
    const response = await this.amadeusService.createOrder(JSON.stringify(data));
    sessionStorage.setItem('amadeus_order_id', response.data.id);
    return response;
  }

  private createPaygateTransactionData(data: FlightCreateOrderResponseModel): string {
    const date = new Date(addMinutes(parseISO(new Date().toISOString()), this.config.preorderDateTimeLimit));
    const result = {
      amount: data.data.flightOffers[0].price.grandTotal,
      currency: data.data.flightOffers[0].price.currency.toUpperCase(),
      payment_options: this.config.paymentOptions,
      preorder_end_date: this.datePipe.transform(date, this.config.preorderDateTimeFormat, 'UTC'),
      order_ref: data.data.id,
      items: 1,
      cart: [{
        product_name: `Flight ticket reservation`,
        product_code: data.data.associatedRecords[0].reference,
        quantity: 1,
        price: data.data.flightOffers[0].price.grandTotal,
        total: data.data.flightOffers[0].price.grandTotal,
        description: 'Flight ticket'
      }]
    };
    let i = 1;
    data.data.flightOffers[0].travelerPricings.forEach(x => {
      result.cart[0][`note_${i}`] = `ID: ${x.travelerId}, TYPE: ${x.travelerType}, PRICE: ${x.price.total}`;
      ++i;
    });
    return JSON.stringify(result);
  }

  private async createTransaction(value: string): Promise<string> {
    const transaction = await this.paygateService.crateTransaction(value);
    sessionStorage.setItem('paygate_trx_id', transaction.transaction_id);
    return transaction.capture_url;
  }

  private noOfferFound = (): void => {
    Swal.fire({
      title: 'Error', html: 'Aucune offre traitable n\'a été trouvée.', icon: 'error', timer: 3500, timerProgressBar: true,
      showConfirmButton: false
    }).then(res => {
      if (res) {
        sessionStorage.removeItem('search-data');
        sessionStorage.removeItem('offer');
        this.router.navigate(['/']).then();
      }
    });
  }

  private getFlightOfferPrice = (): void => {
    const obj = {
      data: {
        type: 'flight-offers-pricing',
        flightOffers: []
      }
    };
    obj.data.flightOffers.push(this.flightOfferModel);

    this.amadeusService.getFlightPricing(JSON.stringify(obj))
      .pipe(this.scavenger.collect(), retry(2))
      .subscribe(data => {
        sessionStorage.setItem('ticket', JSON.stringify(data));
        this.response = data;
        data.data.flightOffers[0].travelerPricings.forEach(x => {
          const model: TravelerModel = {
            gender: 'MALE',
            name: {lastName: '', firstName: '', middleName: null},
            id: x.travelerId,
            dateOfBirth: ''
          };
          if (Number(x.travelerId) === 1) {
            model.documents = [{
              documentType: 'IDENTITY_CARD', // VISA, PASSPORT, IDENTITY_CARD
              holder: true, issuanceCountry: 'SN', issuanceDate: '', expiryDate: '', nationality: '', number: '', birthCountry: ''
            } as DocumentModel];
          }
          this.travelers.push(model);
        });
      }, error => console.log(error), () => this.loading = false);
  }

  private checkInformation = (): boolean => {
    this.submitted = true;
    const arr = this.travelers.filter(x => Number(x.id) > 1 && !(this.isNotNull(x.dateOfBirth?.toString()) ||
      this.isNotNull(x.name.firstName) || this.isNotNull(x.name.lastName) || this.isNotNull(x.gender)));
    const principal = this.checkTravelersPrincipalInformation();
    const ages = this.checkAges;

    if (principal.length > 0 || arr.length > 0 || this.contactForm.invalid || ages.length > 0) {
      const html = principal.length > 0 ? principal : arr.length > 0 ? `Les champs ${arr.length > 1 ? 'du passager ' : 'des passagers '}
      ${arr.join(', ').concat('')} ne sont pas correctement remplis. Veuillez remplir tous les champs pour chaque passager!` :
        this.contactForm.invalid ? 'Veuillez corriger les champs erronés du formulaire de contact!!' : ages;

      Swal.fire({
        title: 'Error', html: `${html}`, icon: 'error', showConfirmButton: false, timerProgressBar: true, timer: 3000,
        allowOutsideClick: false, allowEscapeKey: false
      }).then();
      $('#condition-checkbox').prop('checked', false);
      return false;
    }
    this.contact = {
      emailAddress: this.f.emailAddress.value,
      phones: [{
        deviceType: this.f.deviceType.value,
        countryCallingCode: this.f.countryCallingCode.value.replace(/[^0-9]/g, ''),
        number: this.f.phoneNumber.value.replace(/[^0-9]/g, '')
      }]
    };
    this.travelers.forEach(x => {
      if (Number(x.id) === 1) {
        x.documents[0].issuanceDate = this.datePipe.transform(x.documents[0].issuanceDate, 'yyyy-MM-dd', 'UTC');
        x.documents[0].expiryDate = this.datePipe.transform(x.documents[0].expiryDate, 'yyyy-MM-dd', 'UTC');
      }
      x.dateOfBirth = this.datePipe.transform(x.dateOfBirth, 'yyyy-MM-dd', 'UTC');
      x.contact = this.contact;
      x.documents[0].birthCountry = x.documents[0].nationality.toUpperCase();
    });
    return true;
  }

  private checkTravelersPrincipalInformation = (): string => {
    const x = this.travelers.filter(t => Number(t.id) === 1)[0];
    const array = Array.of<string>(x.dateOfBirth?.toString(), x.name.firstName, x.name.lastName, x.gender, x.documents[0].documentType,
      x.documents[0].number, x.documents[0].nationality, x.documents[0].issuanceDate?.toString(), x.documents[0].expiryDate?.toString(),
      x.documents[0].issuanceCountry).filter(obj => !this.isNotNull(obj));
    if (array.length > 0) {
      return 'Tous les champs du voyageur principal (1) sont requis!';
    } else if (isAfter(this.strToDate(x.documents[0].issuanceDate), new Date())) {
      return 'La date de délivrance de votre document de voyage ne peut pas être supérieure à la date du jour';
    } else if (isBefore(this.strToDate(x.documents[0].expiryDate), this.strToDate(x.documents[0].issuanceDate))) {
      return 'La date d\'émission ne peut pas être supérieure à la date d\'expiration de votre document de voyage';
    } else {
      return '';
    }
  }

  private checkAges = (): string => {
    this.response.data.flightOffers[0].travelerPricings.forEach(x => {
      const t = this.travelers.find(a => a.id === x.travelerId);
      const d = this.strToDate(t.dateOfBirth);
      if (isSameDay(d, new Date()) || isAfter(d, new Date())) {
        return 'La date de naissance du voyageur ' + x.travelerId + ' ne peut pas être supérieure ou égale à la date d\'aujourd\'hui';
      } else if (['infant', 'held_infant', 'seated_infant'].includes(x.travelerType.toLowerCase()) &&
        isBefore(d, subYears(new Date(), 2))) {
        return 'La limite d\'âge pour la catégorie bébé est de 2 ans!';
      } else if (x.travelerType.equalIgnoreCase('child') &&
        (isAfter(d, subYears(new Date(), 2)) || isBefore(d, subYears(new Date(), 12)))) {
        return 'L\'âge pour la catégorie enfant doit être compris entre 2 et 12 ans!';
      } else if (['adult', 'senior'].includes(x.travelerType.toLowerCase()) && isAfter(d, subYears(new Date(), 12))) {
        return 'L\'âge pour la catégorie adulte doit être supérieur à 12 ans!';
      }
    });
    return '';
  }

  private isNotNull = (x: string): boolean => x !== null && x !== undefined && x.length > 0;

  private strToDate = (str: string): Date => new Date(this.datePipe.transform(str, 'yyyy-MM-dd', 'UTC', 'fr-FR'));

  private setContactForm = (): void => {
    this.contactForm = this.fb.group({
        emailAddress: ['', [Validators.email, Validators.required]],
        confirmEmail: ['', [Validators.required]],
        deviceType: ['MOBILE', [Validators.required]],
        flag: ['sn'],
        countryCallingCode: ['+221', [Validators.required, Validators.pattern('[0-9+]{2,5}')]],
        phoneNumber: ['', [Validators.required]]
      },
      {
        validators: [MustMatch('emailAddress', 'confirmEmail'),
          ValidPhone('flag', 'phoneNumber')]
      }
    );
  }
}
