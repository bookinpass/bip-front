import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {AuthService} from './services/authentication/auth.service';
import {LoginComponent} from './users/login/login.component';
import {RegisterComponent} from './users/register/register.component';
import {UserModel} from './models/User.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public client: UserModel = null;
  public title = 'bip-front';
  public innerWidth: number;

  // todo: remove this deps and use form validator on registration and password forgotten

  constructor(private router: Router,
              public dialog: MatDialog,
              private authService: AuthService) {
  }

  // todo: underscore library
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
    const headerHeight = document.getElementById('app-header-container').offsetHeight;
    $('#sidenavContent')[0].style.minHeight = `calc(100vh - ${headerHeight}px)`;
    const outlet = document.getElementById('routerOutlet');
    outlet.style.display = 'flex';
    outlet.style.flexFlow = 'column';
    outlet.style.justifyContent = 'space-between';
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
    const registrationDialog = this.dialog.open(RegisterComponent, {
      panelClass: 'custom-register-dialog',
      width: window.innerWidth > 550 ? '400px' : '95%',
      height: 'auto',
      maxHeight: '95vh',
      maxWidth: '95vh',
      disableClose: true,
      autoFocus: true,
      role: 'dialog',
      hasBackdrop: true,
      backdropClass: 'backdropClass',
      closeOnNavigation: true
    });

    registrationDialog.afterClosed()
      .subscribe(dt => {
        if (dt === true) {
          this.login();
        }
      });
  }
}
