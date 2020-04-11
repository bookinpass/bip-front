import {AbstractControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {CountryCode, isValidNumber} from 'libphonenumber-js';

export function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];
    if (matchingControl.errors && !matchingControl.errors.mustMatch) {
      // return if another validator has already found an error on the matchingControl
      return;
    }
    // set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({mustMatch: true});
    } else {
      matchingControl.setErrors(null);
    }
  }
}

// if value is null, no validator will be performed, else the validation passed as parameter will be applied
export function OptionalValidator(validators?: (ValidatorFn | null | undefined)[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    return control.value ? Validators.compose(validators)(control) : null;
  };
}

export function ValidPhone(countryCodeControlName, telephoneControlName) {
  return (formGroup: FormGroup) => {
    const country = formGroup.controls[countryCodeControlName];
    const telephone = formGroup.controls[telephoneControlName];
    if (telephone.errors && !telephone.errors.checkTelephone) return;
    if (country.errors && !telephone.errors.required) return;
    if (!isValidNumber(telephone.value, country.value.toUpperCase() as CountryCode))
      telephone.setErrors({validPhone: true});
    else telephone.setErrors(null);
  }
}
