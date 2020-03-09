import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {AuthService} from './services/authentication/auth.service';
import {ClientModel} from './models/client.model';
import {LoginComponent} from './authentication/login/login.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  public client: ClientModel = null;
  public title = 'bip-front';
  public innerWidth: number;

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
    this.client = this.authService.getCurrentUser();
    // const footerHeight = $('#app-footer-container > footer').outerHeight(true);
    // $('#main-app-container').css('padding-bottom', footerHeight + 'px');
  }

  ngOnDestroy(): void {
  }

  public login() {
    const dialog = this.dialog.open(LoginComponent, {
      panelClass: 'custom-mat-dialog',
      width: window.innerWidth > 550 ? '400px' : '95%',
      height: 'auto',
      disableClose: true,
      autoFocus: true,
      role: 'dialog',
      hasBackdrop: true,
      backdropClass: 'backdropClass',
      closeOnNavigation: true
    });
    dialog.afterClosed().subscribe((data: any) => {
      if (data.openRegistration) {
        this.register();
      } else {
        this.client = data.connected ? this.authService.getCurrentUser() : null;
      }
    });
  }

  public logout() {
    this.authService.logout();
  }

  public setInnerWidth($event: number) {
    this.innerWidth = $event;
  }

  public register() {
    // const x = window.innerWidth > 768 ? '400px' : '80vw';
    // const registrationDialog = this.dialog.open(RegisterComponent, {
    //   panelClass: 'custom-register-dialog',
    //   width: x,
    //   height: 'max-content',
    // });
    //
    // registrationDialog.afterClosed()
    //     .subscribe(dt => {
    //       const client: ClientModel = dt ? dt.client : null;
    //       if (client !== null) {
    //         this.email = client.email.trim();
    //         this.password = client.password.trim();
    //         this.f.email.reset(this.email);
    //         this.f.email.setErrors(null);
    //         this.f.password.reset(this.password);
    //         this.f.password.setErrors(null);
    //         this.onSubmit();
    //       }
    //     });
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
