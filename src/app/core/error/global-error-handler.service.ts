import {ErrorHandler, Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandlerService implements ErrorHandler {

  constructor() {
  }

  private static getStatus(code: number, min: number, max: number): number {
    return (min <= code && code <= max) ? code : -1;
  }

  private static errorMessageSwitching(error: HttpErrorResponse) {
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
      case 407 || GlobalErrorHandlerService.getStatus(error.status, 409, 499):
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
      case 502 || 503 || GlobalErrorHandlerService.getStatus(error.status, 505, 527):
        message = 'Service temporairement. Veuillez réessayer plus tard SVP';
        break;
      default:
        message = 'Une erreur s\'est produite. Veuillez réessayer SVP';
        break;
    }
    Swal.fire('Erreur', message, 'error');
  }

  public handleError(error: any): void {
    if (error instanceof HttpErrorResponse) {
      if (!navigator.onLine) Swal.fire('Erreur', 'Vous êtes pas connecté à internet. Veuillez vérifier votre connexion');
      else GlobalErrorHandlerService.errorMessageSwitching(error);

      console.error('################################## ERROR ####################################');
      console.error('url: ' + error.url);
      console.error('Status: ' + error.status);
      console.error('msg: ' + error.message);
      console.error('################################## END ERROR ##################################');
    } else console.error(error);
  }

}
