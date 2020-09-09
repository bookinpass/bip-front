import {Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {UrlConfig} from '../../../assets/url.config';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private sanitizer: DomSanitizer) {
  }

  public getImage(id: string, timestamp: string) {
    const name = [id, timestamp].join('-');
    const img = `/assets/images/event/${name}.jpg`;
    return this.sanitizer.bypassSecurityTrustUrl(new UrlConfig().frontHost.concat(img));
  }

}
