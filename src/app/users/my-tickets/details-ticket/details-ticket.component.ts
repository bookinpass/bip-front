import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TransportTicketModel} from '../../../models/transport-ticket.model';
import {EventTicketModel} from '../../../models/event-ticket.model';
import {EventService} from '../../../services/event/event.service';
import {Scavenger} from '@wishtack/rx-scavenger';
import {EventModel} from '../../../models/event.model';
import {GlobalErrorHandlerService} from '../../../core/error/global-error-handler.service';
import {CountryJson} from "../../../../assets/Country.json";
import {CountryCode, isValidNumberForRegion} from "libphonenumber-js";
import Swal from "sweetalert2";
import {SharingService} from "../../../services/ticket-sharing/sharing.service";
import {Location} from "@angular/common";

class TicketSharing {
  ticketId = '';
  firstName = '';
  lastName = '';
  telephone = '';
  countryCode = 'SN';
}

@Component({
  selector: 'app-details-ticket',
  templateUrl: './details-ticket.component.html',
  styleUrls: ['./details-ticket.component.css']
})
export class DetailsTicketComponent implements OnInit, OnDestroy {

  public loading = true;
  public type: string;
  public sharing = false;
  public item: any;
  public event: EventModel;
  public sharedTo = new TicketSharing();
  public countries = new CountryJson().countries;
  public fieldValidity = new Map<string, Array<string>>();
  private scavenger = new Scavenger(this);

  constructor(public dialogRef: MatDialogRef<DetailsTicketComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private eventService: EventService,
              private sharingService: SharingService,
              private location: Location,
              private errorHandler: GlobalErrorHandlerService) {
  }

  ngOnDestroy() {
  }

  ngOnInit(): void {
    this.type = this.data.type;
    if (this.type === 'transport')
      this.item = this.data.item as TransportTicketModel;
    else if (this.type === 'event')
      this.item = this.data.item as EventTicketModel;
    if (this.type === 'event') {
      this.loading = true;
      this.getEvent(this.item.eventId);
    } else if (this.type === 'transport') {
      setTimeout(() => {
        this.loading = false
      }, 2000);
    }
  }

  public checkFields(item: string) {
    const field = [];
    if (this.sharedTo.telephone.length === 0) field.push('required');
    else if (item === 'telephone' && !isValidNumberForRegion(this.sharedTo.telephone, this.sharedTo.countryCode as CountryCode))
      field.push('badFormat');
    else if (field.length > 0) this.fieldValidity.set(item, field);
    else this.fieldValidity.delete(item);
  }

  public cancelSharing() {
    this.sharedTo = new TicketSharing();
    this.fieldValidity.clear();
    this.sharing = false;
  }

  public doSharing() {
    Array.of('firstName', 'lastName', 'telephone').forEach(this.checkFields);
    if (this.fieldValidity.size > 0)
      Swal.fire('Erreur', 'Veuillez corriger le formulaire!', 'error');
    else {
      this.sharedTo.ticketId = this.type === 'event' ? this.item.codeTicket : this.item.idTicket;
      const dial = this.countries.find(x => x.code === this.sharedTo.countryCode).dial_code.replace('+', '');
      this.sharingService.doSharing(JSON.stringify(this.sharedTo), this.type, dial)
        .pipe(this.scavenger.collect())
        .subscribe(data => console.log(data),
          err => this.errorHandler.handleError(err),
          () => this.successfulSharing());
    }
  }

  private getEvent(id: string) {
    this.eventService.getAnEvent(id)
      .pipe(this.scavenger.collect())
      .subscribe(res => this.event = res,
        error => this.errorHandler.handleError(error),
        () => this.loading = false);
  }

  private successfulSharing() {
    const text = this.type = 'event' ? 'le début de l\'événemnt' : this.item.transportType === 'BATEAU' ? 'le départ du bateau' :
      'le départ du bus';
    Swal.fire({
      title: 'Done',
      html: '<p>Le partage du ticket numéro ' + this.sharedTo.ticketId + ' a réussi. Un SMS de confirmation a été envoyé a ' +
        this.sharedTo.firstName + ' ' + this.sharedTo.lastName + '.Vous pouvez révoquer le partage de ce ticket depuis votre espace' +
        ' personnel. <br/> <strong> VEUILLEZ NOTER: </strong> Vous ne pourrez plus retirer ce billet au nouveau détenteur s\'il reste' +
        ' moins d\'une heure avant ' + text + '</p>',
      icon: 'success'
    }).then(res => {
      if (res.value)
        location.reload();
    })
  }
}
