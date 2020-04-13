import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SenegalDDJson} from '../../../assets/SenegalDD.json';
import {DatePipe} from '@angular/common';
import {CalendarEvent, CalendarView} from 'angular-calendar';
import {addDays, isSameDay, isSameMonth, startOfDay} from 'date-fns';
import {AppComponent} from '../../app.component';
import {Subject} from 'rxjs';
import html2canvas from 'html2canvas';
import * as jspdf from 'jspdf';
import {EPaymentData} from '../boat/boat-result.component';
import {EventNominationModel} from '../../models/event-nomination.model';
import {PayExpressParams} from '../../models/pay-express-params';

const colors: any = {
  0: {
    primary: '#ad2121',
    secondary: '#ad9999'
  },
  1: {
    primary: '#FA0000',
    secondary: '#FAE3E3'
  },
  2: {
    primary: '#1e90ff',
    secondary: '#1eFFFF'
  },
  3: {
    primary: '#D10000',
    secondary: '#D1E8FF'
  },
  4: {
    primary: '#e3bc08',
    secondary: '#e39999'
  },
  5: {
    primary: '#ff0000',
    secondary: '#FDF1BA'
  },
  6: {
    primary: '#aabbee',
    secondary: '#0239BA'
  }
};

@Component({
  selector: 'app-bus-result',
  templateUrl: './bus-result.component.html',
  styleUrls: ['./bus-result.component.css']
})
export class BusResultComponent implements OnInit {

  public loading = true;
  public from = '';
  public to = '';
  public passengers = 0;
  public currentStep = 1;
  public ddd: any;
  public selectedDate: any;
  public unitPrice: number;
  public generatedID = AppComponent.makeId(15);
  public view: CalendarView = CalendarView.Month;
  public CalendarView = CalendarView;
  public viewDate: Date = new Date();
  public refresh: Subject<any> = new Subject();
  public activeDayIsOpen = true;
  public events: CalendarEvent[] = [];
  public paymentData = new EPaymentData();

  constructor(public router: Router,
              public activatedRoute: ActivatedRoute,
              public datePipe: DatePipe) {
  }

  ngOnInit() {
    this.from = this.activatedRoute.snapshot.queryParamMap.get('from');
    this.to = this.activatedRoute.snapshot.queryParamMap.get('to');
    this.passengers = +this.activatedRoute.snapshot.queryParamMap.get('passengers');
    this.ddd = new SenegalDDJson()
      .itineraries
      .find(x => x.departPoint.equalIgnoreCase(this.from) && x.arrivalPoint.equalIgnoreCase(this.to));
    if (this.ddd === null || this.ddd === undefined) {
      this.ddd = new SenegalDDJson()
        .itineraries
        .find(x => x.departPoint.equalIgnoreCase(this.to) && x.arrivalPoint.equalIgnoreCase(this.from));
    }
    this.unitPrice = this.ddd.price;
    this.setItineraries();
  }

  public dayClicked({date, events}: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.activeDayIsOpen = !((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0);
      this.viewDate = date;
    }
  }

  public saveData() {

  }

  public closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  public eventClicked($event: { event: CalendarEvent; sourceEvent: MouseEvent | KeyboardEvent }) {
    this.selectedDate = $event.event.start;
  }

  public checkData() {
    if (this.selectedDate !== null && this.selectedDate !== undefined) {
      this.currentStep = 2;
    }
  }

  public getPaymentData() {
    const data = new PayExpressParams();
    data.command_name = `Ticket Bus Senegal Dem Dikk`;
    data.item_name = `Vos tickets de transport ${this.from} - ${this.to}.`;
    data.item_price = this.unitPrice * this.passengers;
    data.success_url = '';
    data.cancel_url = '';
    return data;
  }

  public getPayer() {
    return new EventNominationModel();
  }

  public captureScreen() {
    const data = document.getElementById('ticket-container');
    html2canvas(data).then(canvas => {
      // Few necessary setting options
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      const contentDataURL = canvas.toDataURL('image/png');
      const pdf = new jspdf('p', 'mm', 'a4');
      pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${this.from} - ${this.to}, ${this.selectedDate}.pdf`); // Generated PDF
    });
  }

  private setItineraries() {
    for (let i = 0; i < 30; i++) {
      const date = addDays(startOfDay(new Date()), i);
      const bus = this.from.equalIgnoreCase('dakar') ? this.ddd.depart : this.ddd.retour;
      bus.forEach(alpha => {
        const arrayDays: Array<number> = alpha.days;
        const arrayTimes: Array<number> = alpha.times;
        arrayDays.forEach(x => {
          if (date.getDay() === x) {
            arrayTimes.forEach(y => {
              const dt = new Date(date);
              const hh = y % 1 === 0 ? y : Number(y.toString(10).split(',')[0]);
              dt.setHours(hh, x % 1 === 0 ? 0 : 30, 0, 0);
              this.events.push({
                start: dt,
                allDay: false,
                color: colors[Math.floor(Math.random() * 7)],
                title: `Depart de ${this.from} a ${this.datePipe.transform(dt, 'HH:mm')}`,
                // meta: array.length === 1 ? 0 : array.indexOf(ele)
              });
            });
          }
        });
      });
      if (i === 29) {
        this.loading = false;
      }
    }
  }
}
