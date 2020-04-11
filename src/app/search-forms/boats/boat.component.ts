import {Component, OnInit} from '@angular/core';
import {Params, Router} from '@angular/router';

@Component({
  selector: 'app-boat',
  templateUrl: './boat.component.html',
  styleUrls: ['./boat.component.css']
})
export class BoatComponent implements OnInit {

  public listLiaison = ['Dakar - Ziguinchor'];
  public selectedLiaison = '';
  public listPort = [];
  public selectedPort = '';
  public listBoats = ['Alioune Sitoé Diatta', 'Diambogne', 'Aguene'];
  public selectedBoat = '';

  constructor(private router: Router) {
  }

  ngOnInit() {
  }

  public setPort() {
    const ports = this.selectedLiaison.split('-');
    ports.forEach(x => this.listPort.push(x.trim()));
  }

  public searchCruise() {
    const params: Params = {
      from: this.selectedPort,
      to: this.selectedLiaison.split('-').filter(x => x.trim() !== this.selectedPort)[0].trim()
    };
    if (this.selectedBoat !== '') {
      params.boat = this.selectedBoat;
    }
    this.router.navigate(['search', 'cruise'], {queryParams: params});
  }
}
