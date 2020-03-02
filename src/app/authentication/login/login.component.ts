import {AfterViewInit, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AuthService} from '../../services/authentication/auth.service';
import {Scavenger} from '@wishtack/rx-scavenger';
import {ClientModel} from '../../models/client.model';
import {DatePipe} from '@angular/common';
import {CookiesService} from '../../services/cookie/cookies.service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {GlobalErrorHandlerService} from '../../core/error/global-error-handler.service';
import {retry} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {UrlConfig} from '../../../assets/url.config';
import {faShieldAlt, faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import {SwalConfig} from '../../../assets/SwalConfig/Swal.config';
import {VariableConfig} from '../../../assets/variable.config';
import {RegisterComponent} from '../register/register.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {

  status = 0;
  email = '';
  password = '';
  filterData: any;
  loginForm: FormGroup;

  faClose = faTimesCircle;
  faShield = faShieldAlt;
  loading = false;
  connected = false;
  date: number = +this.datePipe.transform(new Date(), 'HH', 'UTC');
  client: ClientModel;
  showPwd1 = false;
  private urlRepo = new UrlConfig();
  private scavenger = new Scavenger(this);

  constructor(private formBuilder: FormBuilder,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<LoginComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private authService: AuthService,
              private datePipe: DatePipe,
              private cookieService: CookiesService,
              private jwtHelper: JwtHelperService,
              private errorHandler: GlobalErrorHandlerService,
              private http: HttpClient,
              private router: Router) {
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  ngOnInit() {
    this.email = this.cookieService.check('last_email') ? this.cookieService.getCookie('last_email') : '';
    if (this.email.length > 0) {
      setTimeout(() => document.getElementById('passwordRow').focus(), 100);
    }
    if (this.router.url.includes('?registering')) {
      setTimeout(() => this.register(), 200);
    }
    this.setDialogPosition();
    this.loginForm = this.formBuilder.group({
      email: [this.email, [Validators.required, Validators.pattern(new VariableConfig().emailRegex)]],
      password: [this.password, [Validators.required, Validators.minLength(8)]],
    });
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.dialogRef.close(this.connected);
  }

  forgottenPassword() {

  }

  register() {
    const x = window.innerWidth > 768 ? '400px' : '80vw';
    const registrationDialog = this.dialog.open(RegisterComponent, {
      panelClass: 'custom-register-dialog',
      width: x,
      height: 'max-content',
    });

    registrationDialog.afterClosed()
      .subscribe(dt => {
        const client: ClientModel = dt ? dt.client : null;
        if (client !== null) {
          this.email = client.email.trim();
          this.password = client.password.trim();
          this.f.email.reset(this.email);
          this.f.email.setErrors(null);
          this.f.password.reset(this.password);
          this.f.password.setErrors(null);
          this.onSubmit();
        }
      });
  }

  onSubmit() {
    if (!this.f.email.valid) {
      new SwalConfig().ErrorSwalWithNoReturn('Error', 'Le format de votre email est invalide');
    } else if (!this.f.password.valid) {
      new SwalConfig().ErrorSwalWithNoReturn('Error', 'Votre mot de passe doit etre au moins huit (8) caracteres');
 } else {
      this.loading = true;
      this.authService.login(this.email, this.password)
        .pipe(retry(2),
          this.scavenger.collect())
        .subscribe(res => {
          localStorage.setItem('access_token', res.headers.get('Authorization'));
          this.cookieService.setCookie('last_email', this.f.email.value, 30, null);
          this.storeUser(res.headers.get('Authorization'));
        }, error => {
          this.password = '';
          this.loading = false;
          this.connected = false;
          this.errorHandler.handleError(error);
        });
    }
  }

  isEnterKeyPressed($event: KeyboardEvent) {
    if ($event.key === 'Enter') {
      this.onSubmit();
    }
  }

  private storeUser(token: string) {
    return this.http.get<ClientModel>(`${this.urlRepo.host}${this.urlRepo.clients}`,
      {headers: {'content-type': 'application/json', Authorization: token}, params: {email: this.email}})
      .pipe(retry(2),
        this.scavenger.collect())
      .subscribe(result => {
        this.status = 1;
        this.client = result;
        this.cookieService.setCookie('current_user', JSON.stringify(this.client), 14, null);
        this.connected = true;
        if (this.router.url.includes('/details/flight')) { setTimeout(() => window.location.reload(), 1500); }
      }, error => {
        this.password = '';
        this.loading = false;
        this.connected = false;
        this.errorHandler.handleError(error);
      }, () => {
        setTimeout(() => {
          this.loading = false;
          this.dialogRef.close(this.connected);
        }, 3500);
      });
  }

  private setDialogPosition() {
    this.filterData = this.data;
    if (this.filterData !== null) {
      const rightMostPos = window.innerWidth - Number(this.filterData.left);
      this.dialogRef.updatePosition({
        top: `${this.filterData.top}px`,
        right: `${rightMostPos}px`
      });
    }
  }
}
