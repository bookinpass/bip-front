import {AfterViewInit, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AuthService} from '../../services/authentication/auth.service';
import {VariableConfig} from '../../../assets/variable.config';
import {AddressModel, ClientModel, DocumentModel} from '../../models/client.model';
import {faCheck, faTimes, faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import {CountryJson} from '../../../assets/Country.json';
import {AsYouType, CountryCode, isValidNumberForRegion} from 'libphonenumber-js';
import {AirportsJson} from '../../../assets/airports.json';
import {Scavenger} from '@wishtack/rx-scavenger';
import {retry} from 'rxjs/operators';
import {GlobalErrorHandlerService} from '../../core/error/global-error-handler.service';
import {SwalConfig} from '../../../assets/SwalConfig/Swal.config';

const passwordValidator = require('password-validator');

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, AfterViewInit, OnDestroy {

  innerWidth = window.innerWidth;
  faCloseCircle = faTimesCircle;
  faClose = faTimes;
  faCheck = faCheck;
  doFormRecap = false;
  showPwd = false;
  showPwd1 = false;
  displayPasswordHint = false;
  validator = new passwordValidator();
  listCountries = [];
  pwdArrayValidator = ['min', 'uppercase', 'lowercase', 'digits'];
  infoRegistrationForm: FormGroup;
  addressRegistrationForm: FormGroup;
  client = new ClientModel();
  countryCode: string;
  loadingEmail = false;
  isRegistering = false;
  emailUsed = false;
  isDisabled = true;
  private scavenger = new Scavenger(this);

  constructor(private formBuilder: FormBuilder,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<RegisterComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private authService: AuthService) {
  }

  // convenience getter for easy access to form fields
  get info() {
    return this.infoRegistrationForm.controls;
  }

  get addr() {
    return this.addressRegistrationForm.controls;
  }

  private static capitalizeWord(str: string): string {
    const final = [];
    str.split(' ').forEach(word => {
      final.push(word.charAt(0).toUpperCase() + word.substring(1).trim());
    });
    return final.join(' ');
  }

  ngOnInit() {
    this.setListOfCountries();
    this.client.documents = [new DocumentModel()];
    this.client.addresses = [new AddressModel()];
    this.setFormRegistrationGroups();
    this.setPasswordValidator();
  }

  /*
 * remove any events on the stepper's headers to prevent the user from going into another step without filling the form properly
 * keep this function until the linear option is fixed by the material angular team
 */
  ngAfterViewInit(): void {
    setTimeout(() => {
      const el = document.getElementsByClassName('mat-step-header');
      for (let i = 0; i < el.length; i++) {
        const elClone = el.item(i).cloneNode(true);
        el.item(i).parentNode.replaceChild(elClone, el[i]);
        el.item(i).setAttribute('style', 'padding: 4px');
      }
    }, 100);
    $('.mat-vertical-content-container').addClass('ml-0');
    $('.mat-vertical-content').addClass('pl-1 pr-1 pb-3');

    setTimeout(() => {
      $('.main-header-icon')[0].style.right = `${$('.main-header').position().left - 10}px`;
    }, 700);
  }

  ngOnDestroy(): void {
  }

  setPasswordStatus() {
    this.pwdArrayValidator = this.validator.validate(this.info.password.value, {list: true});
    this.info.passwordConfirmation.setValue('');
  }

  passwordConfirmationValidator() {
    this.info.passwordConfirmation.value !== '' && this.info.password.value === this.info.passwordConfirmation.value ?
      this.info.passwordConfirmation.setErrors(null) :
      this.info.passwordConfirmation.setErrors({incorrect: true});
  }

  setPhonePrefix() {
    const country = new AirportsJson().airport.find(x => x.countryName === this.addr.country.value);
    this.countryCode = country.countryCode;
    const x = new CountryJson().countries.find(y => y.code === country.countryCode);
    this.client.addresses[0].phonePrefix = x.dial_code;
    this.client.addresses[0].country = country.countryName;
    this.addr.phone.reset({value: '', disabled: false});
  }

  format_number() {
    this.addr.phone.setValue(new AsYouType(this.countryCode.toUpperCase().trim() as CountryCode).input(this.addr.phone.value));
  }

  checkNumber() {
    isValidNumberForRegion(this.addr.phone.value, this.countryCode as CountryCode) ?
      this.addr.phone.setErrors(null) :
      this.addr.phone.setErrors({incorrect: true});
  }

  setClientInfo() {
    this.client.firstName = RegisterComponent.capitalizeWord(this.info.firstName.value);
    this.client.lastName = RegisterComponent.capitalizeWord(this.info.lastName.value);
    this.client.email = this.info.username.value;
    this.client.password = this.info.password.value;
    if (this.isDisabled) {
      this.client.documents[0] = new DocumentModel();
    } else {
      this.client.documents[0].type = this.info.typeDocument.value;
      this.client.documents[0].identifier = RegisterComponent.capitalizeWord(this.info.idDocument.value);
    }
  }

  setClientAddress() {
    this.client.addresses[0].line1 = RegisterComponent.capitalizeWord(this.addr.line1.value);
    this.client.addresses[0].line2 = RegisterComponent.capitalizeWord(this.addr.line2.value);
    this.client.addresses[0].city = RegisterComponent.capitalizeWord(this.addr.city.value);
    this.client.addresses[0].state = RegisterComponent.capitalizeWord(this.addr.state.value);
    this.client.addresses[0].postalCode = this.addr.postalCode.value;
    this.client.addresses[0].telephone = this.addr.phone.value;
    this.doFormRecap = true;
  }

  submit() {
    if (this.client.documents === undefined || this.client.documents === null || ![1, 2].includes(this.client.documents[0].type)) {
      this.client.documents = null;
    }
    this.isRegistering = true;
    this.authService.register(this.client)
      .pipe(this.scavenger.collect(),
        retry(3))
      .subscribe(_ => {
        new SwalConfig().Fire('Done', 'Inscription reussie !', 'success', false, 'Continuer')
          .then(_ => {
            this.isRegistering = false;
            this.dialogRef.close({client: this.client});
          });
      }, error => {
        this.isRegistering = false;
        new GlobalErrorHandlerService().handleError(error);
      });
  }

  checkExistingEmail() {
    if (this.info.username.valid) {
      this.loadingEmail = true;
      this.authService.checkIdEmailExist(this.info.username.value)
        .pipe(this.scavenger.collect(), retry(3))
        .subscribe((data: boolean) => {
          if (data) {
            new SwalConfig().ErrorSwalWithReturn('Erreur', 'Cet email est déjà utilisé')
              .then(res => {
                if (res) {
                  this.loadingEmail = false;
                  this.emailUsed = true;
                  this.info.username.setErrors({invalid: true});
                }
              });
          } else {
            this.loadingEmail = false;
            this.emailUsed = false;
            this.info.username.setErrors(null);
          }
        }, error => {
          this.loadingEmail = false;
          new GlobalErrorHandlerService().handleError(error);
        });
    }
  }

  selectedTypeDocument() {
    this.isDisabled = this.info.typeDocument.value === '' || this.info.typeDocument.value === undefined;
    this.info.idDocument.reset({value: '', disabled: this.isDisabled});
  }

  private setListOfCountries() {
    new AirportsJson().airport.forEach(airport => {
      if (this.listCountries.indexOf(airport.countryName) < 0) {
        this.listCountries.push(airport.countryName);
      }
    });
    this.listCountries.sort();
  }

  private setPasswordValidator() {
    this.validator
      .is().min(8)                                // Minimum length 8
      .is().max(50)                                   // Maximum length 100
      .has().uppercase()                              // Must have uppercase letters
      .has().lowercase()                              // Must have lowercase letters
      .has().digits()                                 // Must have digits
      .has().not().spaces()                           // Should not have spaces
      .is().not().oneOf(['passer123', 'Passer123', 'Password123']); // Blacklist these values
  }

  private setFormRegistrationGroups() {
    this.infoRegistrationForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.pattern(new VariableConfig().emailRegex)]],
      password: ['', [Validators.required]],
      passwordConfirmation: ['', [Validators.required]],
      typeDocument: ['', Validators.required],
      idDocument: [{value: '', disabled: this.isDisabled}, [Validators.required]]
    });
    this.addressRegistrationForm = this.formBuilder.group({
      line1: ['', [Validators.required]],
      line2: [''],
      city: [''],
      state: ['', Validators.required],
      country: ['', Validators.required],
      postalCode: [''],
      phone: [{value: '', disabled: true}, [Validators.required]]
    });
  }

  // TODO: Check client document Number Identification if it's unique or not
}
