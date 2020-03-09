import {Injectable} from '@angular/core';
import {UrlConfig} from '../../../assets/url.config';
import {HttpClient, HttpParams} from '@angular/common/http';
import {JwtHelperService} from '@auth0/angular-jwt';
import {ClientModel} from '../../models/client.model';
import {Router} from '@angular/router';
import {CookiesService} from '../cookie/cookies.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private urlRepo = new UrlConfig();

  constructor(private http: HttpClient,
              private jwtHelper: JwtHelperService,
              private cookieService: CookiesService,
              private router: Router) {
  }

  public login(username: string, password: string) {
    return this.http.post(`${this.urlRepo.eventHost}${this.urlRepo.loginUrl}`,
      {username, password}, {observe: 'response'});
  }

  public getCurrentUser(): ClientModel {
    if (!this.isLoggedIn()) {
      localStorage.removeItem('access_token');
      if (this.cookieService.check('current_user')) {
        this.cookieService.delete('current_user');
      }
      return null;
    }
    return JSON.parse(this.cookieService.getCookie('current_user'));
  }

  public getResetCode(countryCode: string, dialCode: string, telephone: string) {
    const param = new HttpParams({
      fromObject: {
        countryCode,
        dialCode,
        telephone
      }
    });
    return this.http.get(`${this.urlRepo.eventHost}${this.urlRepo.generateCode}`, {params: param});
  }

  public verifyCodeEntered(code: string, telephone: string) {
    const param = new HttpParams({
      fromObject: {
        code,
        telephone
      }
    });
    return this.http.get(`${this.urlRepo.eventHost}${this.urlRepo.checkCode}`, {params: param});
  }

  public resetPassword(telephone: string, password) {
    const param = new HttpParams({fromObject: {telephone}});
    return this.http.post(`${this.urlRepo.eventHost}${this.urlRepo.resetPassword}`, password, {params: param});
  }

  public isLoggedIn() {
    return !this.jwtHelper.isTokenExpired(this.jwtHelper.tokenGetter()) && this.cookieService.check('current_user');
  }

  public logout() {
    localStorage.removeItem('access_token');
    this.cookieService.delete('current_user');
    this.router.url.startsWith('/home') ?
      window.location.reload() :
      this.router.navigate(['/'])
        .then(_ => window.location.reload());
  }

  public register(client: ClientModel) {
    return this.http.post<string>(`${this.urlRepo.eventHost}${this.urlRepo.registerUrl}`, client);
  }

  public checkIdEmailExist(email: string) {
    return this.http.get<boolean>(`${this.urlRepo.eventHost}${this.urlRepo.doesEmailExist}${email}`);
  }

  public getUserByUsername(username: string) {
    const param: HttpParams = new HttpParams({
      fromObject: {username}
    });
    return this.http.get<ClientModel>(`${this.urlRepo.eventHost}${this.urlRepo.clients}`, {params: param});
  }

}
