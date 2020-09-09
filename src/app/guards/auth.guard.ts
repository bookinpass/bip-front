import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '../services/authentication/auth.service';
import {SwalConfig} from '../../assets/SwalConfig/Swal.config';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService,
              private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    new SwalConfig().ErrorSwalWithReturn('Not connected', 'Veuillez vous connecter afin d\'acceder a la ressource demandee!')
      .then(res => {
        if (res) {
          this.router.navigate(['/']);
        }
      });
    return false;
  }

}
