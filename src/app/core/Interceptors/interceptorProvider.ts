import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AmadeusInterceptor} from './amadeus.interceptor';
import {TokenInterceptor} from './token-interceptor.service';

export const InterceptorProviders =
  [
    {provide: HTTP_INTERCEPTORS, useClass: AmadeusInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true},
  ];
