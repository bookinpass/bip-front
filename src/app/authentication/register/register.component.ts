import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AuthService} from '../../services/authentication/auth.service';
import {faCheck, faTimes} from '@fortawesome/free-solid-svg-icons';
import {Scavenger} from '@wishtack/rx-scavenger';
import {Credential, UserModel} from '../../models/User.model';
import {CountryFRJson} from '../../../assets/Country-FR.json';
import {CountryJson} from '../../../assets/Country.json';
import {CountryCode, formatIncompletePhoneNumber, isValidNumberForRegion} from "libphonenumber-js";
import {retry} from "rxjs/operators";
import {SwalConfig} from "../../../assets/SwalConfig/Swal.config";

const passwordValidator = require('password-validator');

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
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
  public validationError = [];
  public isPhoneNumberValid = true;
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
    this.user.country = 'SN';
    this.countries = new CountryFRJson().countries.filter(x => this.dialCodes.find(y => y.code === x.code) !== undefined);
    this.setPasswordValidator();
  }

  ngOnDestroy(): void {
  }

  public updateDialCode() {
    this.dialCode = this.dialCodes.find(dial => dial.code === this.user.country).dial_code;
  }

  public setPasswordStatus() {
    this.passwordArrayValidator = this.validator.validate(this.user.credential.password, {list: true});
  }

  public verifyPhoneNumber() {
    this.isPhoneNumberValid = isValidNumberForRegion(this.user.telephone, this.user.country as CountryCode);
    this.updateValidatorArray(!this.isPhoneNumberValid, 'telephone');
  }

  public formatNumber() {
    if (this.user.telephone.length > 0) {
      this.user.telephone = formatIncompletePhoneNumber(this.user.telephone, this.user.country as CountryCode);
    }
  }

  public verifyPassword() {
    const x = this.validator.validate(this.user.credential.password, {list: true});
    this.updateValidatorArray(x.length > 0, 'password');
  }

  public save() {
    this.loading = true;
    this.updateValidatorArray(this.user.firstName.length === 0, 'firstName');
    this.updateValidatorArray(this.user.lastName.length === 0, 'lastName');
    this.verifyPassword();
    this.verifyPhoneNumber();
    this.updateValidatorArray(this.user.credential.username.length === 0, 'username');
    if (this.validationError.length > 0) {
      this.loading = false;
    } else {
      this.authService.checkTelephone(this.user.telephone)
        .pipe(retry(2), this.scavenger.collect())
        .subscribe(res => {
          if (res) {
            new SwalConfig().ErrorSwalWithNoReturn('Erreur', 'Ce numéro de téléphone est déjà lié à un compte!');
            if (!this.validationError.includes('telephone')) {
              this.validationError.push('telephone');
            }
            this.loading = false;
          } else {
            this.authService.checkUsername(this.user.credential.username)
              .pipe(this.scavenger.collect(), retry(2))
              .subscribe(result => {
                if (result) {
                  this.updateValidatorArray(true, 'username');
                  new SwalConfig()
                    .ErrorSwalWithNoReturn('Erreur', 'Ce nom d\'utilisateur n\'est pas disponible. Veuillez choisir un autre SVP!');
                  this.loading = false;
                } else {
                  this.register();
                }
              });
          }
        });
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
          new SwalConfig().Fire('Success', 'Votre compte a ete active avec succes. Veuillez vous connecter a present!', "success", false, 'ok')
            .then(result => {
              if (result) {
                this.dialogRef.close(true);
              }
            });
        }
      });
  }

  private register() {
    if (this.validationError.length > 0) {
      new SwalConfig().ErrorSwalWithNoReturn('Erreur', 'Veuillez corriger les champs en rouge!');
      this.loading = false;
    } else {
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
  }

  private updateValidatorArray(insert: boolean, field: string) {
    if (insert) {
      this.validationError.push(field);
    } else {
      this.validationError.splice(this.validationError.indexOf(field), 1);
    }
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
