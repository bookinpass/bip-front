import {Injectable} from '@angular/core';
import {UrlConfig} from '../../../assets/url.config';
import {HttpClient, HttpParams} from '@angular/common/http';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Router} from '@angular/router';
import {CookiesService} from '../cookie/cookies.service';
import {UserModel} from '../../models/User.model';
import {VariableConfig} from "../../../assets/variable.config";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private urlRepo = new UrlConfig();
  private secret = new VariableConfig().captachaSecret;

  constructor(private http: HttpClient,
              private jwtHelper: JwtHelperService,
              private cookieService: CookiesService,
              private router: Router) {
  }

  public login(username: string, password: string) {
    return this.http.post(`${this.urlRepo.mainHost}${this.urlRepo.loginUrl}`,
      {username, password}, {observe: 'response'});
  }

  public getCurrentUser(): UserModel {
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
    return this.http.get(`${this.urlRepo.mainHost}${this.urlRepo.generateCode}`, {params: param});
  }

  public verifyCodeEntered(code: string, telephone: string) {
    const param = new HttpParams({
      fromObject: {
        code,
        telephone
      }
    });
    return this.http.get(`${this.urlRepo.mainHost}${this.urlRepo.checkCode}`, {params: param});
  }

  public resetPassword(telephone: string, password) {
    const param = new HttpParams({fromObject: {telephone}});
    return this.http.post(`${this.urlRepo.mainHost}${this.urlRepo.resetPassword}`, password, {params: param});
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

  public register(user: UserModel, dial: string) {
    const param = new HttpParams({fromObject: {dial}});
    return this.http.post(`${this.urlRepo.mainHost}${this.urlRepo.registerUrl}`, user, {params: param});
  }

  public validateAccount(username: string, code: string) {
    const param = new HttpParams({
      fromObject: {
        username,
        code
      }
    });
    return this.http.get(`${this.urlRepo.mainHost}${this.urlRepo.activateAccount}`, {params: param});
  }

  public checkUsername(username: string) {
    return this.http.get<boolean>(`${this.urlRepo.mainHost}${this.urlRepo.checkUsername}${username}`).toPromise();
  }

  public checkTelephone(telephone: string) {
    return this.http.get<boolean>(`${this.urlRepo.mainHost}${this.urlRepo.checkTelephone}${telephone}`).toPromise();
  }

  public checkEmail(email: string) {
    return this.http.get<boolean>(`${this.urlRepo.mainHost}${this.urlRepo.checkEmail}${email}`).toPromise();
  }

  public getUserByUsername(username: string) {
    const param: HttpParams = new HttpParams({
      fromObject: {username}
    });
    return this.http.get<UserModel>(`${this.urlRepo.mainHost}${this.urlRepo.clients}`, {params: param});
  }

  public async validateCaptacha(response: string) {
    return this.http.post<any>(`${this.urlRepo.mainHost}/captcha/siteVerify`, null, {
      params: {response},
      observe: 'response'
    });
  }

}
