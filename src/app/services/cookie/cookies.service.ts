import {Injectable} from '@angular/core';
import {CookieService} from "ngx-cookie-service";

@Injectable({
  providedIn: 'root'
})
export class CookiesService {

  constructor(private cookie: CookieService) {
  }

  check(name: string): boolean {
    return this.cookie.check(name);
  }

  getCookie(name: string) {
    return this.cookie.get(name);
  }

  setCookie(name: string, value: string, expires: number, secure?: boolean) {
    const date = new Date();
    date.setDate(date.getDate() + expires);
    const domain = window.location.hostname;
    if (!secure)
      secure = false;
    return this.cookie.set(name, value, date, '/', domain, secure, "Strict");
  }

  delete(name: string) {
    this.cookie.delete(name, '/', window.location.hostname);
  }
}
