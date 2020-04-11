import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Scavenger} from '@wishtack/rx-scavenger';
import {GlobalErrorHandlerService} from '../../../core/error/global-error-handler.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MustMatch} from '../../../core/validators/CustomValidators';
import {UserService} from '../../../services/user/user.service';
import {retry} from 'rxjs/operators';
import Swal from 'sweetalert2';
import {AuthService} from "../../../services/authentication/auth.service";

@Component({
  selector: 'app-edit-password',
  templateUrl: './edit-password.component.html',
  styleUrls: ['./edit-password.component.css']
})
export class EditPasswordComponent implements OnInit, OnDestroy {

  public loading = false;
  public oldValid = false;
  public submitted = false;
  public showPassword = false;
  public resetForm: FormGroup;
  private scavenger = new Scavenger(this);

  constructor(public dialogRef: MatDialogRef<EditPasswordComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private formBuilder: FormBuilder,
              private userService: UserService,
              private authService: AuthService,
              private errorHandler: GlobalErrorHandlerService) {
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.resetForm.controls;
  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    this.resetForm = this.formBuilder.group({
      old: ['', [Validators.required]],
      new: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required]
    }, {validator: MustMatch('new', 'confirm')});
  }

  public onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.resetForm.invalid) return;

    this.userService.updatePassword(this.f.old.value, this.f.new.value)
      .pipe(this.scavenger.collect(), retry(2))
      .subscribe(data => {
        if (data.body === 'EXPECTATION_FAILED') {
          Swal.fire('Erreur', 'L\'ancien mot de passe que vous avez entré est incorrect. Veuillez le corriger!', 'error');
        } else if (data.body === 'NOT_MODIFIED') {
          Swal.fire('Erreur', 'L\'ancien mot de passe et le nouveau ne peuvent pas être identiques', 'info');
        } else {
          Swal.fire({
            title: 'Réussi',
            html: 'Votre mot de passe a été modifié avec succès. Vous serez déconnecté. Veuillez vous connecter en utilisant votre' +
              ' nouveau mot de passe.',
            icon: 'success',
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
            showCloseButton: false,
            showCancelButton: false
          }).then(res => {
            if (res) {
              this.authService.logout();
            }
          });
        }
      }, err => this.errorHandler.handleError(err));
  }

  public onReset() {
    this.submitted = false;
    this.resetForm.reset();
  }


}
