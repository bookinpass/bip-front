import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {CalendarEvent, CalendarView} from 'angular-calendar';
import {addDays, isBefore, isDate, isSameDay, isSameMonth, startOfDay} from 'date-fns';
import {ActivatedRoute} from '@angular/router';
import {DakarZiguinchorJson} from '../../../../../assets/dakar-ziguinchor.json';
import {SwalConfig} from '../../../../../assets/SwalConfig/Swal.config';
import {IClientAuthorizeCallbackData} from 'ngx-paypal';
import Swal from 'sweetalert2';
import {CurrencyPipe} from '@angular/common';
import {AppComponent} from '../../../../app.component';
import html2canvas from 'html2canvas';
import * as jspdf from 'jspdf';
import {EPaymentData} from '../../../../core/core-payment-v2/core-payment-v2.component';

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
  public car = 0;
  public bike = 0;
  public idClass = '';
  public cabine = 1;
  public generatedID = AppComponent.makeId(15);
  public paypalDetails: IClientAuthorizeCallbackData;
  public selectedBoat: string;
  public paymentData = new EPaymentData();

  constructor(private activatedRoute: ActivatedRoute,
              private currencyPipe: CurrencyPipe) {
  }

  ngOnInit() {
    this.getBoats();
  }

  public dayClicked({date, events}: { date: Date; events: CalendarEvent[] }): void {
    this.selectedDate = date;
    if (isSameMonth(date, this.viewDate)) {
      this.activeDayIsOpen = !((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0);
      this.viewDate = date;
    }
  }

  public closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  public getDate() {
    return this.selectedDate ? this.selectedDate : this.viewDate;
  }

  public eventClicked($event: { event: CalendarEvent<any>; sourceEvent: MouseEvent | KeyboardEvent }) {
    this.selectedEvent = $event.event;
    this.selectedDate = $event.event.start;
    this.selectedBoat = ['Aline Sitoé Diatta', 'Diambogne', 'Aguene'][this.selectedEvent.meta];
  }

  public updatePaymentData(data: EPaymentData) {
    this.paymentData = data;
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
    } else if (this.selectedClass === null || this.selectedClass === undefined) {
      flag = true;
      swal.ErrorSwalWithNoReturn('Erreur', 'Veuillez choisir une classe de voyage SVP');
    } else if (isNaN(this.adult)) {
      flag = true;
      swal.ErrorSwalWithNoReturn('Erreur', 'Veuillez choisir ou entrer un nombre valide de voyageur adulte SVP');
    } else if (isNaN(this.child)) {
      flag = true;
      swal.ErrorSwalWithNoReturn('Erreur', 'Veuillez choisir ou entrer un nombre valide de voyageur enfant SVP');
    } else if (this.adult < 1 || this.adult > 5) {
      flag = true;
      swal.ErrorSwalWithNoReturn('Erreur', 'Le nombre minimum d\'adultes ne doit pas être inférieur à zéro (0) et ne peut excéder' +
        ' cinq (5) adultes par réservation');
    } else if (this.child < 0 || this.child > 5) {
      flag = true;
      swal.ErrorSwalWithNoReturn('Erreur', 'Le nombre minimum d\'enfants ne doit pas être inférieur à zéro (0) et ne peut excéder' +
        ' cinq (5) enfants par réservation');
    }
    if (this.checkSeats()) {
      flag = true;
      swal.ErrorSwalWithNoReturn('Erreur', 'Vous avez enregistré ' + (this.adult + this.child) + ' voyageurs alors que la cabine' +
        ' sélectionner ne peut contenir que ' + this.selectedClass.seats + ' passagers a la fois. Veuillez modifier le nombre de cabine' +
        ' ou la catégorie choisie afin de faire bénéficié les autres passagers de cabine!');
    }
    if (!flag) {
      this.currentStep = 2;
    }
  }

  public onPaymentError($event: any) {

  }

  public onPaymentSucceed($event: IClientAuthorizeCallbackData) {
    this.paypalDetails = $event;
    Swal.fire({
      title: 'Done',
      html: 'Votre paiement a été approuvé! <br/>' +
        'Numéro de la transaction: ' + this.paypalDetails.id + '<br/>' +
        'Montant net payer: ' + this.currencyPipe.transform(this.setPrice(), this.dkrZig.currency, 'symbol-narrow', '1.1-2'),
      type: 'success',
      showCancelButton: false,
      confirmButtonText: 'OK',
      allowEnterKey: true,
      allowEscapeKey: false,
      allowOutsideClick: false,
      focusConfirm: true,
      position: 'center'
    }).then(res => {
      if (res) {
        this.currentStep = 3;
      }
    });
  }

  public setPrice(): number {
    const cabinePrice = this.cabine * this.selectedClass.price;
    const car = this.car * this.dkrZig.soute.find(x => x.description.equalIgnoreCase('car')).price;
    const bike = this.bike * this.dkrZig.soute.find(x => x.description.equalIgnoreCase('bike')).price;
    return cabinePrice + car + bike;
  }

  public setSelectedPrice() {
    this.selectedClass = this.isResident ? this.dkrZig.resident.find(x => x.type.equalIgnoreCase(this.idClass)) :
      this.dkrZig['non-resident'].find(x => x.type.equalIgnoreCase(this.idClass));
  }

  public setLoading($event: boolean) {
    this.loading = $event;
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

  public updateStep($event: number) {
    this.currentStep = $event;
  }

  private checkSeats() {
    if (this.selectedClass.type === '4') {
      return false;
    }
    const travelers = this.adult + this.child;
    return this.selectedClass.seats * this.cabine < travelers;
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
