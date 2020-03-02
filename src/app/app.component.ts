import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LoginComponent} from './authentication/login/login.component';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {AuthService} from './services/authentication/auth.service';
import {ClientModel} from './models/client.model';

declare const PayExpresse: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  @ViewChild('loginButton', {static: false}) loginButton: ElementRef;
  public client: ClientModel = null;
  public title = 'bip-front';
  public innerWidth: number;

  params = {
    item_name: 'Iphone 7',
    item_price: '560000',
    currency: 'XOF',
    ref_command: 'HBZZYZVUiodwd90ZZZV',
    command_name: 'Paiement Iphone 7 Gold via PayExpresse',
    env: 'test'
  };

  private dialogOpened = false;

  constructor(private router: Router,
              public dialog: MatDialog,
              private authService: AuthService) {
    // router.events
    //   .subscribe(data => {
    // if (data instanceof NavigationEnd && (!data.urlAfterRedirects.startsWith('/details/flight') ||
    // !data.urlAfterRedirects.startsWith('/print'))) {
    //   localStorage.removeItem('ticket');
    // }
    // });
  }

  public static makeId(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$#@?!=';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  ngOnInit(): void {
    // this.client = this.authService.getCurrentUser();
    // const footerHeight = $('#app-footer-container > footer').outerHeight(true);
    // $('#main-app-container').css('padding-bottom', footerHeight + 'px');
  }

  ngOnDestroy(): void {
  }

  public pay() {
    (new PayExpresse({
      item_id: '231987ddsdad',
    })).withOption({
      requestTokenUrl: 'https://bip-event.herokuapp.com/request-payment?name=iphone%206&price=559900.0&order=my%20order',
      method: 'POST',
      headers: {
        Accept: 'application/json'
      },
      prensentationMode: PayExpresse.OPEN_IN_POPUP,
      // tslint:disable-next-line:variable-name
      didPopupClosed(is_completed, success_url, cancel_url) {
        window.location.href = is_completed === true ? success_url : cancel_url;
      },
      willGetToken() {
        console.log('Je me prepare a obtenir un token');
      },
      didGetToken(token, redirectUrl) {
        console.log('Mon token est : ' + token + ' et url est ' + redirectUrl);
      },
      didReceiveError(error) {
        console.log(error);
      },
      didReceiveNonSuccessResponse(jsonResponse) {
        console.log('non success response ', jsonResponse);
        alert(jsonResponse.errors);
      }
    }).send();
  }

  public login() {
    const filterData = {
      top: this.loginButton.nativeElement.getBoundingClientRect().bottom,
      left: this.loginButton.nativeElement.getBoundingClientRect().right
    };
    if (!this.dialogOpened) {
      this.dialogOpened = true;
      const dialog = this.dialog.open(LoginComponent, {
        panelClass: 'custom-mat-dialog',
        data: this.innerWidth > 1200 ? filterData : null,
        width: this.router.url.includes('?registering') ? '0px' : '300px',
        height: this.router.url.includes('?registering') ? '0px' : '265px'
      });
      dialog.afterClosed().subscribe((result: boolean) => {
        this.dialogOpened = false;
        this.client = result ? this.authService.getCurrentUser() : null;
      });
    }
  }

  public logout() {
    this.authService.logout();
  }

  public setInnerWidth($event: number) {
    this.innerWidth = $event;
  }

  public register() {
  }

// @ViewChild("FileInput", {static: false}) fileInput: ElementRef;
//
// public uploader: FileUploader;
// public  isDropOver: any;
// public upload() {
// this.uploader = new FileUploader(
//   {
//     url: `${new UrlConfig().host}/image?directory=airlines&filename=KQ`,
//     autoUpload: true,
//     headers: [{name: 'Accept', value: 'application/json'}]
//   });
// this.uploader.onCompleteAll = () => alert('File uploaded');
// }

// public fileOverAnother(e: any): void {
//   this.isDropOver = e;
// }
//
// public fileClicked() {
//   this.fileInput.nativeElement.click();
// }
}
