import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SenegalDDJson} from '../../../assets/SenegalDD.json';
import {DatePipe} from '@angular/common';
import {CalendarEvent, CalendarView} from 'angular-calendar';
import {addDays, isSameDay, isSameMonth, startOfDay} from 'date-fns';
import {Subject} from 'rxjs';
import {EventNominationModel} from '../../models/event-nomination.model';
import {PayExpressParams} from '../../models/pay-express-params';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ValidPhone} from '../../core/validators/CustomValidators';
import {AuthService} from '../../services/authentication/auth.service';
import {CountryJson} from '../../../assets/Country.json';
import {CountryCode, formatIncompletePhoneNumber} from 'libphonenumber-js';
import {GeneralConditionComponent} from '../../core/modal/general-condition/general-condition.component';
import {MatDialog} from '@angular/material/dialog';
import {UrlConfig} from '../../../assets/url.config';

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
  public selectedDate: Date;
  public unitPrice: number;
  public formGroup: FormGroup;
  public countries = new CountryJson().countries;
  public submitted = false;
  public view: CalendarView = CalendarView.Month;
  public CalendarView = CalendarView;
  public viewDate: Date = new Date();
  public refresh: Subject<any> = new Subject();
  public activeDayIsOpen = true;
  public events: CalendarEvent[] = [];
  public payExpressParam: PayExpressParams;
  private urlConfig = new UrlConfig();

  constructor(public router: Router,
              public activatedRoute: ActivatedRoute,
              public datePipe: DatePipe,
              private fb: FormBuilder,
              private authService: AuthService,
              private dialog: MatDialog) {
  }

  get f() {
    return this.formGroup.controls;
  }

  ngOnInit() {
    this.from = this.activatedRoute.snapshot.queryParamMap.get('from');
    this.to = this.activatedRoute.snapshot.queryParamMap.get('to');
    this.passengers = +this.activatedRoute.snapshot.queryParamMap.get('passengers');
    this.ddd = new SenegalDDJson().itineraries
      .find(x => x.departPoint.equalIgnoreCase(this.from) && x.arrivalPoint.equalIgnoreCase(this.to));
    if (this.ddd === null || this.ddd === undefined)
      this.ddd = new SenegalDDJson().itineraries
        .find(x => x.departPoint.equalIgnoreCase(this.to) && x.arrivalPoint.equalIgnoreCase(this.from));
    this.unitPrice = this.ddd.price;
    for (let i = 0; i < 30; i++) {
      this.setItineraries(i);
      if (i === 29) setTimeout(() => this.loading = false, 1000);
    }
  }

  public formatNumber() {
    return formatIncompletePhoneNumber(this.f.telephone.value, this.f.countryCode.value.toUpperCase() as CountryCode);
  }

  public getDialCode() {
    return this.countries.find(x => x.code === this.f.countryCode.value).dial_code;
  }

  public dayClicked({date, events}: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.activeDayIsOpen = !((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0);
      this.viewDate = date;
    }
  }

  public closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  public eventClicked($event: { event: CalendarEvent; sourceEvent: MouseEvent | KeyboardEvent }) {
    this.selectedDate = $event.event.start;
  }

  public checkData() {
    if (this.selectedDate !== null && this.selectedDate !== undefined) {
      this.setForm();
      this.currentStep = 2;
    }
  }

  public previousStep() {
    this.currentStep = this.currentStep - 1;
    this.formGroup.reset();
  }

  public onSubmit() {
    this.submitted = true;
    if (this.formGroup.invalid) return;
    this.openConditionModal();
    this.payExpressParam = this.getPayExpressParam();
  }

  private getPayExpressParam(): PayExpressParams {
    const req = new PayExpressParams();
    req.command_name = `Ticket Bus Senegal Dem DIKK`;
    req.item_name = `Vos tickets de transport ${this.from} - ${this.to}.`;
    req.item_price = this.unitPrice * this.passengers;
    req.ipn_url = this.urlConfig.mainHost.concat(this.urlConfig.payExpressIpn);
    req.cancel_url = `${location.origin}/transaction?type=transport&items=${this.passengers}`;
    req.success_url = `${location.origin}/transaction?type=transport&items=${this.passengers}`;
    const date = this.datePipe.transform(this.selectedDate, 'yyyy-MM-ddTHH:mm:ss', 'GMT');
    req.custom_field = JSON.stringify({
      id: null,
      type: 'transport',
      tickets: `price#${this.unitPrice}@passengers#${this.passengers}@from#${this.from}@to#${this.to}@at#${date}@type#DDD@name#${this.from + ' - ' + this.to}`,
      firstName: this.f.firstName.value,
      lastName: this.f.lastName.value
    });
    return req;
  }

  private openConditionModal() {
    const dlg = this.dialog.open(GeneralConditionComponent, {
      width: window.innerWidth > 768 ? '800px' : window.innerWidth / 2 + 'px',
      closeOnNavigation: true,
      hasBackdrop: true,
      disableClose: true,
      autoFocus: false,
      direction: 'ltr'
    });
    dlg.afterClosed().subscribe(() => {
      // todo: store local storage
      //
      this.currentStep = 3;
    });
  }

  private setForm() {
    const nom = new EventNominationModel();
    if (this.authService.isLoggedIn()) {
      const model = this.authService.getCurrentUser();
      nom.firstName = model.firstName;
      nom.lastName = model.lastName;
      nom.telephone = model.telephone;
      nom.countryCode = model.countryCode;
    }
    this.formGroup = this.fb.group({
      firstName: [nom.firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [nom.lastName, [Validators.required, Validators.minLength(2)]],
      countryCode: [nom.countryCode, [Validators.required]],
      telephone: [nom.telephone, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    }, {
      validator: ValidPhone('countryCode', 'telephone')
    });
  }

  private setItineraries(i: number) {
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
              start: dt, allDay: false, color: colors[Math.floor(Math.random() * 7)],
              title: `Depart de ${this.from} a ${this.datePipe.transform(dt, 'HH:mm')}`,
            });
          });
        }
      });
    });
  }

}
