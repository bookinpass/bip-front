import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AuthService} from '../../services/authentication/auth.service';
import {faCheck, faTimes} from '@fortawesome/free-solid-svg-icons';
import {Scavenger} from '@wishtack/rx-scavenger';
import {Credential, UserModel} from '../../models/User.model';
import {CountryFRJson} from '../../../assets/Country-FR.json';
import {CountryJson} from '../../../assets/Country.json';
import {CountryCode, formatIncompletePhoneNumber, isValidNumberForRegion} from 'libphonenumber-js';
import {retry} from 'rxjs/operators';
import {SwalConfig} from '../../../assets/SwalConfig/Swal.config';
import {VariableConfig} from '../../../assets/variable.config';

const passwordValidator = require('password-validator');

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  public usedAttribute = {
    username: null,
    email: null,
    telephone: null
  };
  public error = [];
  public isPhoneNumberValid = true;
  public isEmailValid = true;
  public isPasswordValid = true;
  public usernameLength = true;

  public loading = false;
  public showPassword = false;
  public faClose = faTimes;
  public faCheck = faCheck;
  public validator = new passwordValidator();
  public countries = [];
  public user = new UserModel();
  public dialCode = '+221';
  public displayPasswordHint = false;
  public passwordArrayValidator = ['min', 'uppercase', 'lowercase', 'digits'];
  public enterCode = false;
  public code = '';
  private dialCodes = new CountryJson().countries;
  private scavenger = new Scavenger(this);

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<RegisterComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.user.credential = new Credential();
    this.user.countryCode = 'SN';
    this.countries = new CountryFRJson().countries.filter(x => this.dialCodes.find(y => y.code === x.code) !== undefined);
    this.setPasswordValidator();
  }

  ngOnDestroy(): void {
  }

  public updateDialCode() {
    this.dialCode = this.dialCodes.find(dial => dial.code === this.user.countryCode).dial_code;
  }

  public setPasswordStatus() {
    this.passwordArrayValidator = this.validator.validate(this.user.credential.password, {list: true});
    this.checkRequiredField(this.user.credential.password, 'password');
    this.isPasswordValid = this.passwordArrayValidator.length === 0;
  }

  public formatNumber() {
    if (this.user.telephone.length > 0)
      this.user.telephone = formatIncompletePhoneNumber(this.user.telephone, this.user.countryCode as CountryCode);
  }

  public checkRequiredField(value: string, field) {
    if (value === null || value === undefined || value.length === 0) this.error.push(field);
    else {
      if (this.error.indexOf(field) !== -1) this.error.splice(this.error.indexOf(field), 1);
    }
  }

  public async checkEmail() {
    const email = this.user.email;
    if (email.length > 0) {
      this.isEmailValid = new RegExp(new VariableConfig().emailRegex).test(email);
      if (this.isEmailValid) this.usedAttribute.email = (await this.authService.checkUsername(email) as boolean);
    }
  }

  public async checkUsername() {
    const username = this.user.credential.username;
    this.checkRequiredField(username, 'username');
    this.usernameLength = username.length > 3;
    if (!this.error.includes('username')) this.usedAttribute.username = (await this.authService.checkUsername(username) as boolean);
  }

  public async checkTelephone() {
    const telephone = this.user.telephone;
    this.checkRequiredField(telephone, 'telephone');
    if (!this.error.includes('telephone')) {
      this.isPhoneNumberValid = isValidNumberForRegion(this.user.telephone, this.user.countryCode as CountryCode);
      if (this.isPhoneNumberValid) this.usedAttribute.telephone = (await this.authService.checkTelephone(telephone) as boolean);
    }
  }

  public validateAccount() {
    this.authService.validateAccount(this.user.credential.username, this.code)
      .pipe(this.scavenger.collect(), retry(2))
      .subscribe(res => {
        if (res !== 'ACCEPTED') {
          new SwalConfig().ErrorSwalWithNoReturn('Erreur', 'Ce code ne correspond pas au code envoyer par SMS. Veuillez reessayer SVP!');
          this.loading = false;
        } else {
          new SwalConfig().Fire('Success', 'Votre compte a ete active avec succes. Veuillez vous connecter a present!', 'success', false, 'ok')
            .then(result => {
              if (result) this.dialogRef.close(true);
            });
        }
      });
  }

  public register() {
    this.loading = true;
    const bool = !this.usedAttribute.email && !this.usedAttribute.telephone && !this.usedAttribute.username;
    if (this.error.length > 0 || !this.isEmailValid || !this.isPasswordValid || !this.isPhoneNumberValid && !bool) {
      new SwalConfig().ErrorSwalWithNoReturn('Erreur', 'Veuillez corriger les champs en rouge!');
      this.loading = false;
    } else this.doRegistration();
  }

  private doRegistration() {
    this.user.credential.username = this.user.credential.username.toLowerCase().trim();
    if (this.user.email !== undefined && this.user.email !== null && this.user.email.length > 0)
      this.user.email = this.user.email.toLowerCase().trim();

    this.authService.register(this.user, this.dialCode)
      .pipe(this.scavenger.collect(), retry(2))
      .subscribe(res => {
        if (res === 'CREATED') {
          new SwalConfig().Fire('Success', 'Enregistrement reussi. Veuillez entrez le code recu par sms afin d\'activer votre compte'
            , 'success', false, 'ok')
            .then(val => {
              if (val) {
                this.enterCode = true;
                this.loading = false;
              }
            });
        } else {
          new SwalConfig().ErrorSwalWithNoReturn('Erreur', 'Une erreure s\'est produite. Veuillez reessayer SVP!');
          this.loading = false;
        }
      });
  }

  private setPasswordValidator() {
    this.validator
      .is().min(8)                                // Minimum length 8
      .is().max(50)                                   // Maximum length 100
      .has().uppercase()                              // Must have uppercase letters
      .has().lowercase()                              // Must have lowercase letters
      .has().digits()                                 // Must have digits
      .has().not().spaces()                           // Should not have spaces
      .is().not().oneOf(['12345678', 'abcdefgh', 'passer123', 'Passer123', 'Password123']); // Blacklist these values
  }
}
