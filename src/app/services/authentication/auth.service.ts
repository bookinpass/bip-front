import {Injectable} from '@angular/core';
import {UrlConfig} from '../../../assets/url.config';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {JwtHelperService} from '@auth0/angular-jwt';
import {ClientModel} from '../../models/client.model';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private urlRepo = new UrlConfig();

  private headers = new HttpHeaders({
    'content-type': 'application/json'
  });

  private authorizedHeader = new HttpHeaders()
    .append('content-type', 'application/json')
    .append('Authorization', localStorage.getItem('access_token'));

  constructor(private http: HttpClient,
              private jwtHelper: JwtHelperService,
              private cookieService: CookieService,
              private router: Router) {
  }

  login(email, password) {
    return this.http.post<{ access_token: string }>(`${this.urlRepo.host}${this.urlRepo.loginUrl}`,
      {username: email, password}, {headers: this.headers, observe: 'response'});
  }

  getCurrentUser(): ClientModel {
    if (!this.isLoggedIn()) {
      localStorage.removeItem('access_token');
      if (this.cookieService.check('current_user')) {
        this.cookieService.delete('current_user');
      }
      return null;
    }
    return JSON.parse(this.cookieService.get('current_user'));
  }

  isLoggedIn() {
    return !this.jwtHelper.isTokenExpired(this.jwtHelper.tokenGetter()) && this.cookieService.check('current_user');
  }

  logout() {
    localStorage.removeItem('access_token');
    this.cookieService.delete('current_user');
    this.router.url.startsWith('/home') ?
      window.location.reload() :
      this.router.navigate(['/'])
        .then(_ => window.location.reload());
  }

  register(client: ClientModel) {
    return this.http.post<string>(`${this.urlRepo.host}${this.urlRepo.registerUrl}`, client);
  }

  checkIdEmailExist(email: string) {
    return this.http.get<boolean>(`${this.urlRepo.host}${this.urlRepo.doesEmailExist}${email}`);
  }

}
