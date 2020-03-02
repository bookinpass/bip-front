import {ErrorHandler, Injectable} from '@angular/core';
import {SwalConfig} from '../../../assets/SwalConfig/Swal.config';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandlerService implements ErrorHandler {

  swal = new SwalConfig();

  constructor() {
  }

  handleError(error: any): void {

    if (error instanceof HttpErrorResponse) {
      if (!navigator.onLine) {
        this.swal.ErrorSwalWithNoReturn('Erreur', 'Vous êtes pas connecté à internet. Veuillez vérifier votre connexion');
      } else {
        this.errorMessageSwitching(error);
      }
      console.error('################################## ERROR ####################################');
      console.error('An Error occurred');
      console.error('url: ', error.url);
      console.error('Status: ', error.status);
      console.error('msg: ', error.message);
      console.error('################################## END ERROR ####################################');
    } else {
      console.error(error);
    }
  }

  errorMessageSwitching(error: HttpErrorResponse) {
    let message: string;
    switch (error.status) {
      case 400:
        message = 'La syntaxe de la requête est erronée';
        break;
      case 402:
        message = 'Une authentification est nécessaire pour accéder à la ressource. ';
        break;
      case 403:
        message = error.url.includes('/login') ? 'Login ou mot de passe incorrect' :
          'Vos droits d\'accès ne vous permettent pas d\'accéder à la ressource demandée.';
        break;
      case 404:
        message = 'La ressource demandée n\'éxiste pas';
        break;
      case 407 || this.getStatus(error.status, 409, 499):
        message = 'Une erreur s\'est produite. Veuillez réessayer SVP';
        break;
      case 500 || 0:
        message = 'Impossible de joindre le serveur. Veuillez réessayer';
        break;
      case 501:
        message = 'La fonctionnalité demandée n\'est pas supportée par le serveur.';
        break;
      case 504 || 408:
        message = 'Le temps d\'attente est écoulé.  \tLa requête ne peut être traitée en l’état actuel. !';
        break;
      case 502 || 503 || this.getStatus(error.status, 505, 527):
        message = 'Service temporairement. Veuillez réessayer plus tard SVP';
        break;
      default:
        message = 'Une erreur s\'est produite. Veuillez réessayer SVP';
        break;
    }
    this.swal.ErrorSwalWithNoReturn('Erreur', message);
  }

  getStatus(code, min, max): number {
    return (min <= code <= max) ? code : -1;
  }
}
