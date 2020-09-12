import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UrlConfig} from '../../assets/url.config';
import {PaygateTokenModel} from '../models/paygate/paygateToken.model';
import {Scavenger} from '@wishtack/rx-scavenger';
import {CookieService} from 'ngx-cookie-service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {PaygateTransactionResponseModel} from '../models/paygate/paygateTransactionResponse.model';
import {retry} from 'rxjs/operators';
import {PaygateTransactionStatusModel} from '../models/paygate/paygateTransactionStatus.model';

@Injectable({
  providedIn: 'root'
})
export class PaygateService implements OnDestroy {

  private config = new UrlConfig();
  private scavenger = new Scavenger(this);

  constructor(private http: HttpClient,
              private cookieService: CookieService,
              private jwtHelper: JwtHelperService) {
  }

  ngOnDestroy() {
  }

  public async crateTransaction(data: string) {
    const paygate = await this.requestToken();
    return this.http.post<PaygateTransactionResponseModel>(this.config.paygateCreateTransactionUrl, data,
      {
        headers: {
          'Content-Type': 'application/json',
          tokenizer: paygate.connect_token,
          refresh_token: paygate.refresh_token,
          app_id: paygate.appId
        }
      })
      .pipe(this.scavenger.collect(), retry(1))
      .toPromise();
  }

  public async checkTransactionStatus(id: string) {
    const paygate = await this.requestToken();
    return this.http.get<PaygateTransactionStatusModel>(this.config.paygateTransactionStatusUrl.replace('{identifier}', id),
      {
        headers: {
          'Content-Type': 'application/json',
          tokenizer: paygate.connect_token,
          refresh_token: paygate.refresh_token,
          app_id: paygate.appId
        }
      })
      .pipe(this.scavenger.collect(), retry(1))
      .toPromise();
  }

  private async requestToken(): Promise<PaygateTokenModel> {
    if (this.isTokenValid()) {
      return JSON.parse(sessionStorage.getItem('paygate')) as PaygateTokenModel;
    }
    const cookie = await this.http.get<PaygateTokenModel>(this.config.paygateRequestToken, {headers: {'Content-type': 'application/json'}})
      .pipe(this.scavenger.collect(), retry(2))
      .toPromise();
    sessionStorage.setItem('paygate', JSON.stringify(cookie));
    return cookie;
  }

  private isTokenValid() {
    const paygate = sessionStorage.getItem('paygate');
    if (paygate === null || paygate === undefined) {
      return false;
    } else {
      const token = (JSON.parse(sessionStorage.getItem('paygate')) as PaygateTokenModel).connect_token;
      this.jwtHelper.isTokenExpired(token);
      if (this.jwtHelper.isTokenExpired(token)) {
        return false;
      }
    }
    return true;
  }
}
