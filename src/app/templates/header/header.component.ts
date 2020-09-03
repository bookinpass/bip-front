import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Scavenger} from '@wishtack/rx-scavenger';
import {ClientModel} from '../../models/client.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  @ViewChild('loginButton') loginButton: ElementRef;
  @Input() client: ClientModel | null;

  @Output() loginEmitter = new EventEmitter();
  @Output() logoutEmitter = new EventEmitter();
  @Output() registrationEmitter = new EventEmitter();
  @Output() sidebarEmitter = new EventEmitter();
  @Output() innerWidth = new EventEmitter<number>();
  public home = false;
  private scavenger: Scavenger = new Scavenger(this);

  constructor(private router: Router) {
    router.events
      .pipe(this.scavenger.collect())
      .subscribe(arg => {
        if (arg instanceof NavigationEnd) {
          setTimeout(() => {
            if (arg.url.startsWith('/contact') || arg.url.startsWith('/about') || arg.url.startsWith('/how-to'))
              $('#navbarNav > .nav-item')[0].classList.remove('active');
            else
              $('#navbarNav > .nav-item')[0].classList.add('active');
          }, 100);
        }
      });
  }

  ngOnInit() {
    this.innerWidth.emit(window.innerWidth);
  }

  ngOnDestroy(): void {
  }

}
