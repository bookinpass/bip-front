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
    // await this.amadeusService.setToken();
    // this.flightOfferModel = JSON.parse(localStorage.getItem('offer')) as FlightOfferModel;
    // if (this.flightOfferModel === null || this.flightOfferModel === undefined) this.noOfferFound();
    // else this.getFlightOfferPrice();
    this.response = JSON.parse(localStorage.getItem('ticket')) as FlightOfferPricingResponseModel;
    this.response.data.flightOffers[0].travelerPricings.forEach(x => {
      const model: TravelerModel = {
        gender: 'MALE',
        name: {lastName: '', firstName: '', middleName: null},
        id: x.travelerId,
        dateOfBirth: ''
      };
      if (Number(x.travelerId) === 1)
        model.documents = [{
          documentType: 'IDENTITY_CARD', // VISA, PASSPORT, IDENTITY_CARD
          holder: true, issuanceCountry: 'sn', issuanceDate: '', expiryDate: '', nationality: '', number: '', birthCountry: ''
        } as DocumentModel];
      this.travelers.push(model)
    });
    this.loading = false;
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
      dialog.afterClosed()
        .subscribe(() => {
          // document.getElementById('buttonPayment').classList.remove('d-none');
        });
    }
  }

  public formatNumber = () =>
    this.f.phoneNumber.setValue(formatIncompletePhoneNumber(this.f.phoneNumber.value, this.f.flag.value.toUpperCase() as CountryCode));

  public updateFlag = () =>
    this.f.flag.setValue(this.countries.find(x => x.dial_code === this.f.countryCallingCode.value).code.toLowerCase());

  public async proceedToPayment() {
    const date = new Date(addMinutes(parseISO(new Date().toISOString()), this.config.preorderDateTimeLimit));
    const value = JSON.stringify(
      {
        amount: 100.00,
        currency: this.config.currency,
        payment_options: this.config.paymentOptions,
        preorder_end_date: this.datePipe.transform(date, this.config.preorderDateTimeFormat, 'UTC'),
        order_ref: '3701',
        items: 1,
        cart: [{
          product_name: 'product 1',
          product_code: 'ADBFRT345',
          quantity: 2,
          price: '50.00',
          total: '100.00',
          description: ''
        }]
      }
    );
    const transaction = await this.paygateService.crateTransaction(value);
    sessionStorage.setItem('created_trx', JSON.stringify(transaction));
    window.open(transaction.capture_url, '_self');
  }

  private noOfferFound = (): void => {
    Swal.fire({
      title: 'Error', html: 'Aucune offre traitable n\'a été trouvée.', icon: 'error', timer: 3500, timerProgressBar: true,
      showConfirmButton: false
    }).then(res => {
      if (res) {
        localStorage.removeItem('search-data');
        localStorage.removeItem('offer');
        this.router.navigate(['/']).then();
      }
    })
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
        localStorage.setItem('ticket', JSON.stringify(data))
        this.response = data;
        data.data.flightOffers[0].travelerPricings.forEach(x => {
          const model: TravelerModel = {
            gender: 'MALE',
            name: {lastName: '', firstName: '', middleName: null},
            id: x.travelerId,
            dateOfBirth: ''
          };
          if (Number(x.travelerId) === 1)
            model.documents = [{
              documentType: 'IDENTITY_CARD', // VISA, PASSPORT, IDENTITY_CARD
              holder: true, issuanceCountry: 'SN', issuanceDate: '', expiryDate: '', nationality: '', number: '', birthCountry: ''
            } as DocumentModel];
          this.travelers.push(model)
        });
      }, error => console.log(error), () => this.loading = false);
  }

  private checkInformation = (): boolean => {
    this.submitted = true;
    const arr = this.travelers.filter(x => Number(x.id) > 1 && !(this.isNOD(x.dateOfBirth?.toString()) || this.isNOD(x.name.firstName) ||
      this.isNOD(x.name.lastName) || this.isNOD(x.gender)));
    const principal = this.checkTravelersPrincipalInformation();
    const ages = this.checkAges;

    if (principal.length > 0 || arr.length > 0 || this.contactForm.invalid || ages !== null) {
      const txt = principal.length > 0 ? principal : arr.length > 0 ? `Les champs ${arr.length > 1 ? 'du passager ' : 'des passagers '}
      ${arr.join(', ').concat('')} ne sont pas correctement remplis. Veuillez remplir tous les champs pour chaque passager!` :
        this.contactForm.invalid ? 'Veuillez corriger les champs erronés!' : ages;

      Swal.fire({
        title: 'Error', html: `${txt}`, icon: 'error', showConfirmButton: false, timerProgressBar: true, timer: 3000,
        allowOutsideClick: false, allowEscapeKey: false
      }).then();
      $('#condition-checkbox').prop('checked', false);
      return false;
    }
    const contact: ContactModel = {
      emailAddress: this.f.emailAddress.value,
      phones: [{
        deviceType: this.f.deviceType.value, countryCallingCode: this.f.countryCallingCode.value,
        number: (this.f.phoneNumber.value as any).number.replace(/[^0-9]/g, '')
      }]
    };
    this.travelers.forEach(x => {
      if (Number(x.id) === 1) {
        x.documents[0].issuanceDate = this.datePipe.transform(x.documents[0].issuanceDate, 'yyyy-MM-dd', 'UTC');
        x.documents[0].expiryDate = this.datePipe.transform(x.documents[0].expiryDate, 'yyyy-MM-dd', 'UTC');
      }
      x.dateOfBirth = this.datePipe.transform(x.dateOfBirth, 'yyyy-MM-dd', 'UTC');
      x.contact = contact
    });
    console.log(this.travelers);
    return true;
  }

  private checkTravelersPrincipalInformation = (): string => {
    const x = this.travelers.filter(t => Number(t.id) === 1)[0];
    return !(this.isNOD(x.dateOfBirth?.toString()) && this.isNOD(x.name.firstName) && this.isNOD(x.name.lastName) && this.isNOD(x.gender)
      || this.isNOD(x.documents[0].documentType) && this.isNOD(x.documents[0].nationality) &&
      this.isNOD(x.documents[0].issuanceDate?.toString()) && this.isNOD(x.documents[0].expiryDate?.toString()) &&
      this.isNOD(x.documents[0].issuanceCountry)) ? 'Tous les champs du voyageur principal (1) doivent être remplis' :
      isAfter(this.strToDate(x.documents[0].issuanceDate), new Date()) ?
        'La date de délivrance de votre document de voyage ne peut pas être supérieure à la date du jour' :
        isBefore(this.strToDate(x.documents[0].expiryDate), this.strToDate(x.documents[0].issuanceDate)) ?
          'La date d\'émission ne peut pas être supérieure à la date d\'expiration de votre document de voyage' : '';
  }

  private checkAges = (): string | null => {
    this.response.data.flightOffers[0].travelerPricings.forEach(x => {
      const t = this.travelers.find(a => a.id === x.travelerId);
      const d = this.strToDate(t.dateOfBirth);
      if (isSameDay(d, new Date()) || isAfter(d, new Date()))
        return 'La date de naissance du voyageur ' + x.travelerId + ' ne peut pas être supérieure ou égale à la date d\'aujourd\'hui';
      else if (['infant', 'held_infant', 'seated_infant'].includes(x.travelerType.toLowerCase()) &&
        isBefore(d, subYears(new Date(), 2))) return 'La limite d\'âge pour la catégorie bébé est de 2 ans!';
      else if (x.travelerType.equalIgnoreCase('child') &&
        (isAfter(d, subYears(new Date(), 2)) || isBefore(d, subYears(new Date(), 12))))
        return 'L\'âge pour la catégorie enfant doit être compris entre 2 et 12 ans!'
      else if (['adult', 'senior'].includes(x.travelerType.toLowerCase()) && isAfter(d, subYears(new Date(), 12)))
        return 'L\'âge pour la catégorie adulte doit être supérieur à 12 ans!';
    });
    return null;
  }

  private isNOD = (x: string): boolean => {
    return x !== null && x !== undefined && x.length > 0;
  }

  private strToDate = (str: string): Date => {
    return new Date(this.datePipe.transform(str, 'yyyy-MM-dd', 'UTC'));
  }

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
    )
  }
}
