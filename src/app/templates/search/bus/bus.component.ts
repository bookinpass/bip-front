import {Component, OnInit} from '@angular/core';
import {SenegalDDJson} from '../../../../assets/SenegalDD.json';
import {Router} from '@angular/router';
import {SwalConfig} from '../../../../assets/SwalConfig/Swal.config';

@Component({
  selector: 'app-bus',
  templateUrl: './bus.component.html',
  styleUrls: ['./bus.component.css']
})
export class BusComponent implements OnInit {

  public from = '';
  public departures = new Set<string>();
  public arrivals = new Set<string>();
  public to = '';
  public passengers = 1;
  private ddd = new SenegalDDJson().itineraries;

  constructor(private router: Router) {
  }

  ngOnInit() {
    this.ddd.forEach(x => {
      this.departures.add(x.departPoint);
      this.departures.add(x.arrivalPoint);
    });
    const list = Array.from(this.departures);
    list.sort();
    this.departures.clear();
    list.forEach(x => this.departures.add(x));
  }

  public searchBus() {
    if (this.from === '' || this.to === '' || this.passengers === null || this.passengers === undefined || this.passengers === 0) {
      new SwalConfig().ErrorSwalWithNoReturn('Erreur', 'Tous les champs sont obligatoires.');
    } else {
      this.router.navigate(['search', 'bus'], {queryParams: {from: this.from, to: this.to, passengers: this.passengers}});
    }
  }

  public setReturn() {
    if (!this.from.equalIgnoreCase('dakar')) {
      const list = this.ddd.filter(x => x.arrivalPoint.equalIgnoreCase(this.from));
      this.arrivals.clear();
      list.forEach(x => {
        this.arrivals.add(x.departPoint);
      });
    } else {
      this.departures.forEach(x => this.arrivals.add(x));
      this.arrivals.delete('Dakar');
    }
  }
}
