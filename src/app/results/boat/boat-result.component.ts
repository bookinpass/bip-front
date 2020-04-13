import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {CalendarEvent, CalendarView} from 'angular-calendar';
import {addDays, isBefore, isDate, isSameDay, isSameMonth, startOfDay} from 'date-fns';
import {ActivatedRoute} from '@angular/router';
import {DakarZiguinchorJson} from '../../../assets/dakar-ziguinchor.json';
import {SwalConfig} from '../../../assets/SwalConfig/Swal.config';
import {AppComponent} from '../../app.component';
import html2canvas from 'html2canvas';
import * as jspdf from 'jspdf';
import {PayExpressParams} from '../../models/pay-express-params';
import {EventNominationModel} from '../../models/event-nomination.model';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};

export class EPaymentData {
  orderId: string;
  ticketId: string;
  status: string;
  type: string;
  price: number;
  payer: EventNominationModel;
}

@Component({
  selector: 'app-boat-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './boat-result.component.html',
  styleUrls: ['./boat-result.component.css']
})
export class BoatResultComponent implements OnInit {

  public loading = true;
  public isResident = true;
  public currentStep = 1;
  public selectedDate: Date;
  public departure: string;
  public arrival: string;
  public departTime: number;
  public arrivalTime: number;
  public dkrZig = new DakarZiguinchorJson().sheet;
  public adult = 1;
  public child = 0;
  public selectedClass: any;
  public selectedEvent: CalendarEvent;
  public view: CalendarView = CalendarView.Month;
  public CalendarView = CalendarView;
  public viewDate: Date = new Date();
  public refresh: Subject<any> = new Subject();
  public activeDayIsOpen = true;
  public events: CalendarEvent[] = [];
  public cars = 0;
  public bikes = 0;
  public idClass = '';
  public cabine = 1;
  public generatedID = AppComponent.makeId(15);
  public selectedBoat: string;
  public paymentData = new EPaymentData();
  public sitoeResidentTravelers = new Map<number, Map<boolean, number>>();
  public sitoeNonResidentTravelers = new Map<number, Map<boolean, number>>();
  public otherBoatTravelers = new Map<string, Map<boolean, number>>();

  constructor(private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.getBoats();
  }

  public updateMapTravelers(isResident: boolean, type: number, isAdult: boolean) {
    const id = (isAdult ? 'adult' : 'child').concat(isResident ? '-resident' : '-non-resident').concat(`-cabine-${type}`);
    // @ts-ignore
    const value = Number($(`#${id}`)[0].value);
    let arr;
    if (isResident) {
      arr = this.sitoeResidentTravelers.has(type) ? this.sitoeResidentTravelers.get(type) : new Map<boolean, number>();
    } else {
      arr = this.sitoeNonResidentTravelers.has(type) ? this.sitoeNonResidentTravelers.get(type) : new Map<boolean, number>();
    }
    arr.set(isAdult, value);
    if (isResident) this.sitoeResidentTravelers.set(type, arr);
    else this.sitoeNonResidentTravelers.set(type, arr);
  }

  public updateOtherTravelers(isResident: boolean, isAdult: boolean) {
    const id = (isAdult ? 'adult' : 'child').concat(isResident ? '-resident' : '-non-resident');
    // @ts-ignore
    const value = Number($(`#${id}`)[0].value);
    let arr;
    if (isResident) {
      arr = this.otherBoatTravelers.has('resident') ? this.otherBoatTravelers.get('resident') : new Map<boolean, number>();
    } else {
      arr = this.otherBoatTravelers.has('non-resident') ? this.otherBoatTravelers.get('non-resident') : new Map<boolean, number>();
    }
    arr.set(isAdult, value);
    this.otherBoatTravelers.set(isResident ? 'resident' : 'non-resident', arr);
  }

  public dayClicked({date, events}: { date: Date; events: CalendarEvent[] }): void {
    this.selectedDate = date;
    if (isSameMonth(date, this.viewDate)) {
      this.activeDayIsOpen = !((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0);
      this.viewDate = date;
    }
  }

  public eventClicked($event: { event: CalendarEvent<any>; sourceEvent: MouseEvent | KeyboardEvent }) {
    this.selectedEvent = $event.event;
    this.selectedDate = $event.event.start;
    this.selectedBoat = '';
    this.sitoeResidentTravelers.clear();
    this.sitoeNonResidentTravelers.clear();
    this.otherBoatTravelers.clear();
    this.selectedBoat = ['Aline Sitoé Diatta', 'Diambogne', 'Aguene'][this.selectedEvent.meta];
  }

  public closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  public getDate() {
    return this.selectedDate ? this.selectedDate : this.viewDate;
  }

  public ok() {
    console.log(this.sitoeResidentTravelers);
    console.log(this.sitoeNonResidentTravelers);
    console.log(this.otherBoatTravelers);

    if (!this.proceedToPayment()) {
      this.currentStep = 2;
    }
  }

  public proceedToPayment() {
    let flag = false;
    const swal = new SwalConfig();
    if (!isDate(this.selectedDate) || isBefore(this.selectedDate, new Date())) {
      flag = true;
      swal.ErrorSwalWithNoReturn('Erreur', 'Veuillez choisir une date valide SVP');
    } else if (this.selectedBoat === null || this.selectedBoat === '') {
      flag = true;
      swal.ErrorSwalWithNoReturn('Erreur', 'Veuillez choisir un bateau sur le calendrier SVP');
    }
    return flag;
    /*else if (isNaN(this.adult) || isNaN(this.child)) {
      flag = true;
      const x = isNaN(this.adult)
      swal.ErrorSwalWithNoReturn('Erreur', 'Veuillez choisir ou entrer un nombre valide de voyageur enfant SVP');
    }
     else if (this.adult < 1 || this.adult > 5) {
      flag = true;
      swal.ErrorSwalWithNoReturn('Erreur', 'Le nombre minimum d\'adultes ne doit pas être inférieur à zéro (0) et ne peut excéder' +
        ' cinq (5) adultes par réservation');
    } else if (this.child < 0 || this.child > 5) {
      flag = true;
      swal.ErrorSwalWithNoReturn('Erreur', 'Le nombre minimum d\'enfants ne doit pas être inférieur à zéro (0) et ne peut excéder' +
        ' cinq (5) enfants par réservation');
    }*/

  }

  public getPaymentData() {
    const data = new PayExpressParams();
    data.command_name = `Vos tickets de transport maritime, ${this.selectedClass.description}`;
    data.item_name = `Billet de transport ${this.departure} - ${this.arrival}`;
    data.item_price = this.getPrice();
    data.success_url = '';
    data.cancel_url = '';
    return data;
  }

  public getPayer() {
    return new EventNominationModel();
  }

  public getPrice(): number {
    const cabinePrice = this.cabine * this.selectedClass.price;
    const car = this.cars * this.dkrZig.soute.find(x => x.description.equalIgnoreCase('car')).price;
    const bike = this.bikes * this.dkrZig.soute.find(x => x.description.equalIgnoreCase('bike')).price;
    return cabinePrice + car + bike;
  }

  public setSelectedPrice() {
    this.selectedClass = this.isResident ? this.dkrZig.resident.find(x => x.type.equalIgnoreCase(this.idClass)) :
      this.dkrZig['non-resident'].find(x => x.type.equalIgnoreCase(this.idClass));
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
      pdf.save(`${this.departure} - ${this.arrival}, ${this.selectedDate}.pdf`); // Generated PDF
    });
  }

  private getBoats() {
    this.selectedBoat = this.activatedRoute.snapshot.queryParamMap.has('boat') ?
      this.activatedRoute.snapshot.queryParamMap.get('boat') : '';
    this.departure = this.activatedRoute.snapshot.queryParamMap.get('from');
    this.departTime = this.departure.equalIgnoreCase('Dakar') ? 20 : this.departure.equalIgnoreCase('Ziguinchor') ? 11 : 0;
    this.arrivalTime = this.departure.equalIgnoreCase('Dakar') ? 11 : this.departure.equalIgnoreCase('Ziguinchor') ? 7 : 0;
    this.arrival = this.activatedRoute.snapshot.queryParamMap.get('to');
    this.setEvents();
  }

  private setEvents() {
    for (let i = 1; i < 60; i++) {
      const date = addDays(startOfDay(new Date()), i);
      const array = this.activatedRoute.snapshot.queryParamMap.has('boat') ?
        [this.selectedBoat] : ['Aline Sitoé Diatta', 'Diambogne', 'Aguene'];
      array.forEach(ele => {
        const ttl = this.setTitle(date.getDay(), ele);
        const clr = ele.startsWith('Ali') ? colors.blue : ele.startsWith('Dia') ? colors.yellow : colors.red;
        if (ttl !== null) {
          this.events.push({
            start: date,
            allDay: false,
            color: clr,
            title: ttl,
            meta: array.length === 1 ? 0 : array.indexOf(ele)
          });
        }
      });
      if (i === 59) {
        this.loading = false;
      }
    }
  }

  private setTitle(day: number, boat: string) {
    if (this.departure.equalIgnoreCase('dakar')) {
      if (((day === 2 || day === 5) && boat.trim().toLowerCase().startsWith('ali')) || ((day === 4 || day === 0) &&
        (boat.trim().toLowerCase().startsWith('dia') || boat.trim().toLowerCase().startsWith('ag')))) {
        return `Départ a ${this.departTime}h a bord de ${boat}`;
      }
    } else if (this.departure.equalIgnoreCase('ziguinchor') && (day === 4 || day === 0) && boat.trim().toLowerCase().startsWith('ali') ||
      ((day === 2 || day === 5) && (boat.trim().toLowerCase().startsWith('dia') || boat.trim().toLowerCase().startsWith('ag')))) {
      return `Départ a ${this.departTime}h a bord de ${boat}`;
    }
    return null;
  }

}
