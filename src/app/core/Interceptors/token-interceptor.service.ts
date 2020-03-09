import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {JwtHelperService} from '@auth0/angular-jwt';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(public helper: JwtHelperService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.helper.tokenGetter();
    if (token !== null && token !== undefined) {
      req = req.clone({
        setHeaders:
          {
            Authorization: token,
            'Content-type': 'application/json'
          }
      });
    }
    return next.handle(req);
  }

}
