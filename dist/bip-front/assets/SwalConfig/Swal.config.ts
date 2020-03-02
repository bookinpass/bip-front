import Swal, {SweetAlertType} from 'sweetalert2';

export class SwalConfig {

  date: Date;

  public Fire(title: string,
              text: string,
              type: SweetAlertType,
              showCancelButton: boolean,
              confirmButtonText,
              cancelButtonText?) {
    return Swal.fire({
      title,
      text,
      type,
      showCancelButton,
      confirmButtonText,
      cancelButtonText: showCancelButton && cancelButtonText !== null && cancelButtonText !== undefined ? cancelButtonText : 'Annuler',
      showCloseButton: false,
      focusConfirm: true,
      customClass: '/style.css',
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      buttonsStyling: true,
      position: 'center',
    });
  }

  public ErrorSwalWithNoReturn(title: string,
                               text: string) {
    Swal.fire({
      title,
      text,
      type: 'error',
      confirmButtonText: 'OK',
      showCancelButton: false,
      showCloseButton: false,
      focusConfirm: true,
      customClass: '/styles.css',
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      buttonsStyling: true,
      position: 'center',
      focusCancel: true
    }).then();
  }

  public ErrorSwalWithReturn(title: string,
                             text: string) {
    return Swal.fire({
      title,
      text,
      type: 'error',
      confirmButtonText: 'OK',
      focusConfirm: true,
      showCancelButton: false,
      showCloseButton: false,
      customClass: '/styles.css',
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      buttonsStyling: true,
      position: 'center',
    });
  }

}
