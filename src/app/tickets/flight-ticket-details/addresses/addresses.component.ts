import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AirportsJson} from '../../../../assets/airports.json';
import {CountryJson} from '../../../../assets/Country.json';
import {AsYouType, CountryCode, isValidNumberForRegion} from 'libphonenumber-js';
import {faFemale, faMale} from '@fortawesome/free-solid-svg-icons';
import {HttpClient} from '@angular/common/http';
import {CookiesService} from '../../../services/cookie/cookies.service';
import {VariableConfig} from '../../../../assets/variable.config';
import {Scavenger} from '@wishtack/rx-scavenger';
import {SwalConfig} from '../../../../assets/SwalConfig/Swal.config';
import {AuthService} from '../../../services/authentication/auth.service';
import {PhoneModel, TravelerModel} from '../../../models/amadeus/Traveler.model';
import {DatePipe} from '@angular/common';
import {AirportModel} from '../../../models/airport.model';

@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.css']
})
export class AddressesComponent implements OnInit, OnDestroy {
  @Output() principalStatus: EventEmitter<boolean> = new EventEmitter();
  @Input() principal: TravelerModel;

  public faMale = faMale;
  public faFemale = faFemale;
  public listCountries = [];
  public countryCode: string;
  public isNumberValidForRegion: boolean;
  public loading = false;
  public selectedCountry = '';
  public countries = new Array<AirportModel>();
  public setError = new Set<string>();
  public isEmailValid = true;
  private variables = new VariableConfig();
  private scavenger = new Scavenger(this);
  private swal = new SwalConfig();
  private countriesJson = new CountryJson();

  constructor(private http: HttpClient,
              private cookieService: CookiesService,
              private authService: AuthService,
              private datePipe: DatePipe) {
  }

  private static isNullOrUndefined(obj: any) {
    return obj === null || obj === undefined;
  }

  ngOnInit() {
    new AirportsJson().airport.forEach(x => {
      if (this.countries.findIndex(t => t.countryCode === x.countryCode) === -1) {
        this.countries.push(x);
      }
    });
    this.countries.sort((a, b) => {
      return a.countryName > b.countryName ? 1 : a.countryName < b.countryName ? -1 : 0;
    });
    this.principal.contact.phones[0] = new PhoneModel();
    this.setListOfCountries();
  }

  ngOnDestroy(): void {
  }

  public parseDate(dateString: string) {
    return this.datePipe.transform(new Date(dateString), 'yyyy-MM-dd');
  }

  public setBirthCountry(code: string) {
    this.principal.documents.birthCountry = code;
    const x = this.countriesJson.countries.find(x => x.code === code);
    this.principal.documents.birthPlace = x === null || x === undefined ? '' : x.name;
  }

  public setDocumentDeliveryCountry(code: string) {
    this.principal.documents.issuanceCountry = code;
    const pre = this.countriesJson.countries.find(x => x.code === code);
    this.principal.documents.issuanceLocation = pre === null || pre === undefined ? '' : pre.name;
  }

  public setPhonePrefix() {
    const country = new AirportsJson().airport.find(x => x.countryName === this.selectedCountry);
    this.countryCode = country.countryCode;
    this.principal.contact.address.countryCode = country.countryCode;
    const x = new CountryJson().countries.find(y => y.code === country.countryCode);
    this.principal.contact.phones[0].countryCallingCode = x === null || x === undefined ? '' : x.dial_code;
  }

  public format_number() {
    this.principal.contact.phones[0].number = new AsYouType(this.countryCode.toUpperCase().trim() as CountryCode)
      .input(this.principal.contact.phones[0].number);
  }

  public checkNumber() {
    this.isNumberValidForRegion = isValidNumberForRegion(this.principal.contact.phones[0].number.toString(),
      this.countryCode.toUpperCase() as CountryCode);
  }

  public locateUser() {
    this.loading = true;
    window.navigator.geolocation.getCurrentPosition(
      position => this.getCurrentUserPosition(position)
      , error => this.handleLocationError(error)
      , {timeout: 20000, maximumAge: 86400000, enableHighAccuracy: true}); // time are set in milliseconds. 30 seconds and 12H
  }

  public checkInformation() {
    this.updateErrors('firstName', this.principal.name.firstName.length === 0);
    this.updateErrors('lastName', this.principal.name.lastName.length === 0);
    this.updateErrors('gender', this.principal.gender.length === 0);
    this.updateErrors('email', this.principal.contact.emailAddress.length === 0);
    this.updateErrors('birthDate', this.principal.dateOfBirth.length === 0);
    this.updateErrors('birthPlace', this.principal.documents.birthPlace.length === 0);
    this.updateErrors('documentType', this.principal.documents.documentType.length === 0);
    this.updateErrors('documentNumber', this.principal.documents.number.length === 0);
    this.updateErrors('line', this.principal.contact.address.lines[0].length === 0);
    this.updateErrors('state', this.principal.contact.address.stateName.length === 0);
    this.updateErrors('country', this.principal.contact.phones[0].countryCallingCode.length === 0);
    this.updateErrors('phone', this.principal.contact.phones[0].number.length === 0);
    if (this.setError.size > 0 || !this.isEmailValid) {
      $('#principal-condition').prop('checked', false);
      this.principalStatus.emit(false);
      this.swal.ErrorSwalWithNoReturn('Erreur', 'Veuillez corriger les champs en rouge');
    } else {
      $('#principal-condition').prop('checked', true);
      this.principalStatus.emit(true);
    }
  }

  public emailValidityChecker() {
    if (this.principal.contact.emailAddress.length > 0) {
      const x = this.principal.contact.emailAddress.match(new VariableConfig().emailRegex);
      this.isEmailValid = x !== null && x !== undefined && x.length > 0;
    } else {
      this.isEmailValid = false;
    }
  }

  private setListOfCountries() {
    new AirportsJson().airport.forEach(airport => {
      if (this.listCountries.indexOf(airport.countryName) < 0) {
        this.listCountries.push(airport.countryName);
      }
    });
    this.listCountries.sort();
  }

  private getCurrentUserPosition(data: Position) {
    this.http.get(`https://us1.locationiq.com/v1/reverse.php?key=${this.variables.apiTokenKey}
        &lat=${data.coords.latitude}&lon=${data.coords.longitude}&format=json
        &accept-language=${this.variables.locationDefaultLanguage}`)
      .pipe(this.scavenger.collect())
      .subscribe(result => {
          const arg: any = result;
          this.cookieService.setCookie('current_location', JSON.stringify(arg.address), 2, false);
          this.principal.contact.address.lines[0] = arg.address.suburb
            .concat(!AddressesComponent.isNullOrUndefined(arg.address.road) ? `, Rue ${arg.address.road}` : '');
          this.principal.contact.address.cityNam = arg.address.city;
          this.principal.contact.address.stateName = arg.address.state;
          const ap = new AirportsJson().airport
            .find(x => x.countryCode.equalIgnoreCase(arg.address.country_code));
          this.selectedCountry = ap.countryName;
          this.principal.contact.address.countryCode = ap.countryCode;
          this.principal.contact.phones[0].countryCallingCode = new CountryJson().countries
            .find(x => x.code.equalIgnoreCase(arg.address.country_code)).dial_code;
          this.countryCode = arg.address.country_code;
          this.loading = false;
        }, () => {
          this.loading = false;
          this.swal.ErrorSwalWithNoReturn('Erreur',
            `Une erreur s'est produite lors de la tentative de récupération de votre position actuelle. Veuillez réessayer plus tard!`);
        }
      );
  }

  private handleLocationError(error: PositionError) {
    let msg = '';
    switch (error.code) {
      case 1:
        msg = `Vous n'avez pas autorisé le service à accéder à votre emplacement actuel. Veuillez utiliser l'icône de positionnement à
        gauche de la barre d'URL afin que le service puisse obtenir votre positionnement actuel.`;
        break;
      case 2:
        msg = 'Nous n\'avons pas pu vous obtenir votre emplacement actuel. Veuillez rééssayer s\'il vous plait';
        break;
      case 3:
        msg = 'Time-out';
        break;
    }
    this.swal.ErrorSwalWithReturn('Erreur', msg)
      .then(_ => this.loading = false);
  }

  private updateErrors(field: string, add: boolean) {
    add ? this.setError.add(field) : this.setError.delete(field);
  }
}
