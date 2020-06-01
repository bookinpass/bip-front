import {Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private sanitizer: DomSanitizer) {
  }

  public getImage(id: string, timestamp: string) {
    const name = [id, timestamp].join('-');
    return this.sanitizer.bypassSecurityTrustUrl(`https://bookinpass.000webhostapp.com/assets/images/event/${name}.jpg`);
  }

}
