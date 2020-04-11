import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../../services/user/user.service';
import {Scavenger} from '@wishtack/rx-scavenger';
import {retry} from 'rxjs/operators';
import {GlobalErrorHandlerService} from '../../core/error/global-error-handler.service';
import Swal from 'sweetalert2';
import {UserModel} from '../../models/User.model';
import {CountryJson} from '../../../assets/Country.json';
import {CountryCode, formatIncompletePhoneNumber} from 'libphonenumber-js';
import {MatDialog} from '@angular/material/dialog';
import {EditPasswordComponent} from './edit-password/edit-password.component';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OptionalValidator, ValidPhone} from '../../core/validators/CustomValidators';
import {AuthService} from '../../services/authentication/auth.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit, OnDestroy {

  public editing = false;
  public loading = true;
  public user: UserModel;
  public countries = new CountryJson().countries;
  public userForm: FormGroup;
  public submitted = false;
  private scavenger = new Scavenger(this);

  constructor(private userService: UserService,
              private dialog: MatDialog,
              private fb: FormBuilder,
              private router: Router,
              private authService: AuthService,
              private errorHandler: GlobalErrorHandlerService) {
  }

  get f() {
    return this.userForm.controls;
  }

  ngOnDestroy(): void {
  }

  ngOnInit() {
    this.getUser();
  }

  public updatePassword() {
    const dlg = this.dialog.open(EditPasswordComponent, {
      width: '360px',
      height: 'max-content',
      id: 'user-details-ticket-dialog',
      hasBackdrop: true,
      disableClose: true,
      closeOnNavigation: true,
      data: {username: this.user.credential.username}
    });
    dlg.afterClosed()
      .subscribe(data => {
        if (data) this.router.navigate(['/']);
      });
  }

  public getIdType() {
    return this.user.idType === undefined || this.f.idType.value === null ? '' : this.f.idType.value.toLowerCase() === 'cni' ?
      'Carte National d\'Identité' : this.f.idType.value.toLowerCase() === 'passport' ? 'Passeport' : '';
  }

  public formatNumber() {
    return formatIncompletePhoneNumber(this.f.telephone.value, this.f.countryCode.value.toUpperCase() as CountryCode);
  }

  public getCountry() {
    return this.countries.find(x => x.code === this.user.countryCode).name;
  }

  public resetForm() {
    this.loading = true;
    this.submitted = false;
    this.userForm.reset();
    this.createForm();
    this.editing = false;
    this.loading = false;
  }

  public getDialCode() {
    return this.countries.find(x => x.code === this.f.countryCode.value).dial_code;
  }

  public onSubmit() {
    this.submitted = true;
    if (this.userForm.invalid) {
      return;
    }
    this.loading = true;
    let userUpdate = new UserModel();
    userUpdate = Object.assign(userUpdate, this.userForm.value);
    this.userService.updateUser(userUpdate)
      .pipe(this.scavenger.collect(), retry(2))
      .subscribe(data => {
        if (data.ok) {
          if (this.user.credential.username === this.f.username.value)
            Swal.fire('Done', 'La modification du profile a reussi', 'success')
              .then(res => {
                if (res) location.reload();
              });
          else Swal.fire('Done', 'La modification du profil a réussi. En raison de la modification de votre nom d\'utilisateur, ' +
            'vous serez déconnecté. Veuillez vous reconnecter avec votre nouveau nom d\'utilisateur.', 'success')
            .then(res => {
              if (res) this.authService.logout();
            })
        }
      }, err => {
        this.errorHandler.handleError(err);
        this.loading = false;
      });
  }

  private createForm() {
    this.userForm = this.fb.group({
      firstName: [this.user.firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [this.user.lastName, [Validators.required, Validators.minLength(2)]],
      email: [this.user.email, OptionalValidator([Validators.maxLength(200), Validators.email])],
      username: [this.user.credential.username, [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      idType: [this.user.idType],
      idNumber: [this.user.idNumber],
      line: [this.user.line],
      city: [this.user.city],
      state: [this.user.state],
      postalCode: [this.user.postalCode, OptionalValidator([Validators.pattern(/^[0-9]+$/)])],
      countryCode: [this.user.countryCode, [Validators.required]],
      telephone: [this.user.telephone, [Validators.required, Validators.pattern(/^[0-9]+$/)]]
    }, {
      validator: ValidPhone('countryCode', 'telephone')
    });
  }

  private getUser() {
    this.userService.getUser()
      .pipe(retry(2), this.scavenger.collect())
      .subscribe(
        data => {
          this.user = data;
          this.createForm();
        }, _ =>
          Swal.fire('Error', 'Une erreure s\'est produite lors de la recupération de votre profile. Veuillez rééssayer SVP',
            'error',).then((res => {
            if (res) location.reload();
          })), () => this.loading = false);
  }
}
