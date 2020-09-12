import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {UrlConfig} from '../../../assets/url.config';

@Injectable()
export class AmadeusInterceptor implements HttpInterceptor {

  private url = new UrlConfig();

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith(this.url.amadeusBaseUrl) && !req.url.endsWith(this.url.requestAmadeusToken)) {
      req = req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + sessionStorage.getItem('ama_token'),
          'content-type': 'application/json'
        }
      });
    }
    return next.handle(req);
  }

}
