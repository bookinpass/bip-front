import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AuthService} from '../../services/authentication/auth.service';
import {ClientModel} from '../../models/client.model';
import {CookiesService} from '../../services/cookie/cookies.service';
import {GlobalErrorHandlerService} from '../../core/error/global-error-handler.service';
import {faShieldAlt, faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import {retry} from 'rxjs/operators';
import {Scavenger} from '@wishtack/rx-scavenger';
import {CountryFRJson} from '../../../assets/Country-FR.json';
import {CountryJson} from '../../../assets/Country.json';
import {CountryCode, isValidNumberForRegion} from 'libphonenumber-js';
import {SwalConfig} from '../../../assets/SwalConfig/Swal.config';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  public status = 0;
  public loginForm: FormGroup;
  public resetForm: FormGroup;
  public faClose = faTimesCircle;
  public faShield = faShieldAlt;
  public loading = false;
  public showPwd = false;
  public resetPassword = false;
  public country = 'SN';
  public dialCode = '+221';
  public telephone: string;
  public enterCode = false;
  public countries = [];
  public code: string;
  public isCodeValid = false;
  public newPwd = '';
  public pwdConfirmation = '';
  public showPwd2 = false;
  private connected = false;
  private client: ClientModel;
  private dialsCodes = new CountryJson().countries;
  private scavenger = new Scavenger(this);

  constructor(private formBuilder: FormBuilder,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<LoginComponent>,
              private authService: AuthService,
              private cookieService: CookiesService,
              private errorHandler: GlobalErrorHandlerService) {
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  get r() {
    return this.resetForm.controls;
  }

  ngOnInit() {
    this.countries = new CountryFRJson().countries.filter(x => this.dialsCodes.find(y => y.code === x.code) !== undefined);
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnDestroy(): void {
  }

  public getDialCode() {
    this.dialCode = this.dialsCodes.find(dial => dial.code === this.country).dial_code;
  }

  public generateCode() {
    if (this.telephone.length > 0 && !isValidNumberForRegion(this.telephone, this.country as CountryCode)) {
      new SwalConfig().ErrorSwalWithNoReturn('Erreur', ' Ce numero n\'est pas valide');
    } else {
      this.loading = true;
      this.authService.getResetCode(this.country, this.dialCode, this.telephone)
        .pipe(this.scavenger.collect())
        .subscribe(res => {
          this.loading = false;
          if (res === 'NOT_FOUND') {
            new SwalConfig().ErrorSwalWithNoReturn('Erreur', 'Ce numéro ne correspond à aucun compte');
          } else if (res === 'CREATED') {
            new SwalConfig().Fire('Reset', `Un code de verification vient d'etre envoyée sur le ${this.dialCode.concat(this.telephone)}. Veuillez rentrer le code SVP!`,
              'success', false, 'OK')
              .then(result => {
                if (result) {
                  this.enterCode = true;
                }
              });
          }
        }, error => {
          this.errorHandler.handleError(error);
          this.loading = false;
        });
    }
  }

  public validateCode() {
    this.loading = true;
    this.authService.verifyCodeEntered(this.code, this.telephone)
      .pipe(this.scavenger.collect(), retry(1))
      .subscribe(res => {
        this.isCodeValid = res === 'ACCEPTED';
        if (!this.isCodeValid) {
          new SwalConfig().ErrorSwalWithNoReturn('Erreur: Code erroné', 'Veuillez entrer le code reçu par SMS SVP!');
        } else {
          this.loading = false;
        }
      }, error => {
        this.loading = false;
        this.errorHandler.handleError(error);
      });
  }

  public changePassword() {
    if (this.pwdConfirmation !== this.newPwd) {
      new SwalConfig().ErrorSwalWithNoReturn('Erreur', 'Les mots de passe sont différents. Veuillez corriger cette erreure SVP!');
    } else {
      this.code = '';
      this.loading = true;
      this.authService.resetPassword(this.telephone, this.newPwd)
        .pipe(retry(1), this.scavenger.collect())
        .subscribe(res => {
          this.loading = false;
          if (res === 'ACCEPTED') {
            new SwalConfig().Fire('Modifier', 'Votre mot de passe a été changé avec succès, veuillez vous connecter maintenant ' +
              'avec votre nouveau mot de passe.', 'success', false, 'OK')
              .then(result => {
                if (result) {
                  this.newPwd = '';
                  this.pwdConfirmation = '';
                  this.telephone = '';
                  this.isCodeValid = false;
                  this.enterCode = false;
                  this.resetPassword = false;
                }
              });
          } else if (res === 'NOT_MODIFIED') {
            new SwalConfig().ErrorSwalWithNoReturn('Erreur', 'Une erreur s\'est produite et votre mot de passe n\'a pas pu être ' +
              'modifié. Veuillez réessayer');
          }
        }, error => {
          this.loading = false;
          this.errorHandler.handleError(error);
        });
    }
  }

  public register() {
    this.dialogRef.close({
      openRegistration: true,
      connected: false
    });
  }

  public onSubmit() {
    this.loading = true;
    this.authService.login(this.f.email.value, this.f.password.value)
      .pipe(this.scavenger.collect(),
        retry(2))
      .subscribe(res => {
        localStorage.setItem('access_token', res.headers.get('Authorization'));
        this.cookieService.setCookie('last_email', this.f.email.value, 10, null);
        this.storeUser();
      }, error => {
        this.f.password.reset();
        this.loading = false;
        this.connected = false;
        this.errorHandler.handleError(error);
      });
  }

  private storeUser() {
    this.authService.getUserByUsername(this.f.email.value)
      .subscribe(result => {
        this.status = 1;
        this.client = result;
        this.connected = true;
        this.cookieService.setCookie('current_user', JSON.stringify(this.client), 5, null);
      }, error => {
        this.loading = false;
        this.connected = false;
        this.errorHandler.handleError(error);
      }, () => {
        setTimeout(() => {
          this.dialogRef.close({
            connected: this.connected,
            openRegistration: false
          });
        }, 2000);
      });
  }

}
