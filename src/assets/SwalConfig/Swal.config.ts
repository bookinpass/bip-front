import Swal, {SweetAlertIcon} from 'sweetalert2';

export class SwalConfig {

  public Fire(title: string,
              text: string,
              icon: SweetAlertIcon,
              showCancelButton: boolean,
              confirmButtonText,
              cancelButtonText?) {
    return Swal.fire({
      title,
      text,
      icon,
      showCancelButton,
      confirmButtonText,
      cancelButtonText: showCancelButton && cancelButtonText !== null && cancelButtonText !== undefined ? cancelButtonText : 'Annuler',
      showCloseButton: false,
      focusConfirm: true,
      customClass: {
        title: 'swal2-title',
        icon: 'swal2-icon',
        content: 'swal2-content',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel',
      },
      allowOutsideClick: false,
      allowEnterKey: true,
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
      icon: 'error',
      confirmButtonText: 'OK',
      showCancelButton: false,
      showCloseButton: false,
      focusConfirm: true,
      customClass: {
        title: 'swal2-title',
        icon: 'swal2-icon',
        content: 'swal2-content',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel',
      },
      allowOutsideClick: false,
      allowEnterKey: true,
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
      icon: 'error',
      confirmButtonText: 'OK',
      focusConfirm: true,
      showCancelButton: false,
      showCloseButton: false,
      customClass: {
        title: 'swal2-title',
        icon: 'swal2-icon',
        content: 'swal2-content',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel',
      },
      allowOutsideClick: false,
      allowEnterKey: true,
      allowEscapeKey: false,
      buttonsStyling: true,
      position: 'center',
    });
  }

}
