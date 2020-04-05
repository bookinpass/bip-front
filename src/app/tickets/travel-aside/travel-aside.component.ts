import {Component, Input, OnInit} from '@angular/core';
import {FlightModel, TravelerPricingsEntity} from '../../models/amadeus/flight.model';
import {TravelerTypeEnum} from '../../models/traveler-type.enum';

@Component({
  selector: 'app-travel-aside',
  templateUrl: './travel-aside.component.html',
  styleUrls: ['./travel-aside.component.css']
})
export class TravelAsideComponent implements OnInit {

  @Input() ticket: FlightModel;
  @Input() from: string;
  @Input() to: string;

  public pricing = new Array<TravelerPricingsEntity>();
  public travelerTypeMap = new Map<string, number>();
  private travelerTypeEnum = TravelerTypeEnum;

  constructor() {
  }

  ngOnInit() {
    this.getTravelersType();
    this.getPrices();
  }

  public getDuration(isWayToGo: boolean) {
    const duration = (isWayToGo ? this.ticket.itineraries[0].duration : this.ticket.itineraries[1].duration).split('H');
    const hh = duration[0].replace(/[^0-9]/gi, '');
    const mm = duration[1].replace(/[^0-9]/gi, '');
    return `${hh}h ${mm}min.`;
  }

  private getTravelersType() {
    this.ticket.travelerPricings.forEach(x => {
      if (this.travelerTypeMap.has(this.travelerTypeEnum[x.travelerType])) {
        let num = this.travelerTypeMap.get(this.travelerTypeEnum[x.travelerType]);
        this.travelerTypeMap.set(this.travelerTypeEnum[x.travelerType], ++num);
      } else {
        this.travelerTypeMap.set(this.travelerTypeEnum[x.travelerType], 1);
      }
    });
  }

  private getPrices() {
    this.ticket.travelerPricings.forEach(x => {
      if (this.pricing.findIndex(t => t.travelerType === x.travelerType) === -1) {
        this.pricing.push(x);
      }
    });
    this.pricing.forEach(x => {
      x.travelerType = this.travelerTypeEnum[x.travelerType];
    });
    this.pricing.sort((a, b) => {
      return a.travelerType > b.travelerType ? 1 : a.travelerType < b.travelerType ? -1 : 0;
    });

  }
}
