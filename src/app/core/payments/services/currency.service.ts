import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  constructor(private http: HttpClient) {
  }

  getCurrencyConverterRate(from: string, to: string, amount: number) {
    const param = new HttpParams({
      fromObject: {
        format: 'json',
        from,
        to,
        amount: amount.toString()
      }
    });
    const header = new HttpHeaders({
      'x-rapidapi-host': 'currency-converter5.p.rapidapi.com',
      'x-rapidapi-key': '67568f8200msh5098fd2bce948a2p156272jsn548d1cf520b5'
    });
    return this.http.get('https://currency-converter5.p.rapidapi.com/currency/convert', {headers: header, params: param});
  }
}
