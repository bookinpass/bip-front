import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TransportTicketModel} from '../../../models/transport-ticket.model';
import {TicketEventModel} from '../../../models/ticket-event.model';
import {EventService} from '../../../services/event/event.service';
import {Scavenger} from '@wishtack/rx-scavenger';
import {EventModel} from '../../../models/event.model';
import {GlobalErrorHandlerService} from '../../../core/error/global-error-handler.service';
import {CountryJson} from '../../../../assets/Country.json';
import {CountryCode, formatIncompletePhoneNumber, isValidNumberForRegion} from 'libphonenumber-js';
import Swal, {SweetAlertIcon} from 'sweetalert2';
import {SharingService} from '../../../services/ticket-sharing/sharing.service';
import {retry} from 'rxjs/operators';

import * as _ from 'underscore.string/humanize'

export class TicketSharing {
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
              private errorHandler: GlobalErrorHandlerService) {
  }

  ngOnDestroy() {
  }

  ngOnInit(): void {
    this.loading = true;
    this.type = this.data.type;
    if (this.type === 'transport') this.item = this.data.item as TransportTicketModel;
    else if (this.type === 'event') {
      this.item = this.data.item as TicketEventModel;
      this.getEvent(this.item.eventId);
    }
    this.item.isShared ? this.getSharing() : this.loading = false;
  }

  public formatNumber() {
    this.sharedTo.telephone = formatIncompletePhoneNumber(this.sharedTo.telephone, this.sharedTo.countryCode as CountryCode);
  }

  public checkFields(item: string) {
    const field = [];
    if (this.sharedTo[item].length === 0) field.push('required');
    else if (item === 'telephone' && !isValidNumberForRegion(this.sharedTo.telephone, this.sharedTo.countryCode as CountryCode))
      field.push('badFormat');
    if (field.length > 0) this.fieldValidity.set(item, field);
    else this.fieldValidity.delete(item);
  }

  public cancelSharing() {
    this.sharedTo = new TicketSharing();
    this.fieldValidity.clear();
    this.sharing = false;
  }

  public doSharing() {
    this.loading = true;
    Array.of('firstName', 'lastName', 'telephone').forEach(x => this.checkFields(x));
    if (this.fieldValidity.size > 0)
      Swal.fire('Erreur', 'Veuillez corriger le formulaire!', 'error');
    else {
      this.sharedTo.ticketId = this.item.codeTicket;
      this.sharedTo.telephone = this.sharedTo.telephone.split(' ').join('');
      const dial = this.countries.find(x => x.code === this.sharedTo.countryCode).dial_code.replace('+', '');
      this.sharingService.doSharing(JSON.stringify(this.sharedTo), this.type, dial)
        .pipe(this.scavenger.collect(), retry(2))
        .subscribe(data => {
            if (data.status === 200) {
              const text = this.type = 'event' ? 'le début de l\'événement' : this.item.transportType === 'BATEAU' ? 'le départ du bateau' :
                'le départ du bus';
              const msg = '<p>Le partage du ticket numéro ' + this.sharedTo.ticketId + ' a réussi. Un SMS de confirmation a été envoyé a ' +
                this.sharedTo.firstName + ' ' + this.sharedTo.lastName + '.Vous pouvez révoquer le partage de ce ticket depuis votre' +
                ' espace personnel. <br/> <strong> VEUILLEZ NOTER: </strong> Vous ne pourrez plus retirer ce billet au nouveau détenteur' +
                ' s\'il reste moins d\'une heure avant ' + text + '</p>';
              this.messageDialog('Partage', msg, 'success');
            } else if (data.status === 404) this.errorDialog();
          },
          err => {
            this.errorHandler.handleError(err);
            this.loading = false;
          });
    }
  }

  public revokeSharing() {
    this.loading = true;
    this.sharingService.revokeTicket(this.item.sharingId, this.type)
      .pipe(this.scavenger.collect())
      .subscribe(data => {
          if (data.ok) this.messageDialog('Reussi',
            'Le partage de ce ticket a été supprimé avec succès. Vous êtes à nouveau son titulaire.', 'success');
          else this.errorDialog();
        },
        err => {
          this.errorHandler.handleError(err);
          this.loading = false;
        });
  }

  public attributeTicket() {
    const name = `<strong>${_(this.sharedTo.firstName)} ${_(this.sharedTo.lastName)}</strong>`;
    Swal.fire({
      title: `Attribution de ticket`,
      html: '<p>Vous êtes sur le point d\'attribuer le ticket à ' + name + '. Une fois l\'attribution effectuée, vous ne pourrez plus' +
        ' effectuer aucune action sur ce ticket. ' + name + ' deviendra le nouveau propriétaire du ticket. Souhaitez-vous continuer ?</p>',
      icon: 'question',
      allowEscapeKey: false, allowEnterKey: false, allowOutsideClick: false, showCloseButton: false, showCancelButton: true,
      cancelButtonText: 'Non', confirmButtonText: 'Oui', focusConfirm: true, cancelButtonColor: 'red', confirmButtonColor: 'green'
    }).then(res => {
      if (res.value) {
        this.sharingService.attributeTicket(this.type, this.item.sharingId)
          .pipe(retry(2), this.scavenger.collect())
          .subscribe(data => {
            if (data.ok) this.messageDialog('Attribution', 'Le ticket a été attribué avec succès.', 'success');
            else this.messageDialog('Attribution', 'L\'attribution du ticket a échoué. Veuillez réessayer SVP.', 'error');
          });
      } else if (res.dismiss) Swal.fire('Attribution', 'L\'attribution du ticket a été annulé!', 'info');
    });
  }

  private getEvent(id: string) {
    this.eventService.getAnEvent(id)
      .pipe(this.scavenger.collect(), retry(2))
      .subscribe(res => this.event = res,
        error => this.errorHandler.handleError(error),
        () => {
          if (this.item.isShared) this.getSharing();
          else this.loading = false
        });
  }

  private getSharing() {
    this.sharingService.getSharing(this.item.sharingId, this.type)
      .pipe(this.scavenger.collect(), retry(2))
      .subscribe(data => {
          this.sharedTo = data;
          this.formatNumber();
        }, err => this.errorHandler.handleError(err),
        () => this.loading = false);
  }

  private messageDialog(head: string, msg: string, type: string) {
    Swal.fire({
      title: head,
      html: msg,
      icon: type as SweetAlertIcon,
      showCloseButton: false,
      allowEnterKey: false,
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then(res => {
      if (res.value)
        location.reload();
    })
  }

  private errorDialog() {
    Swal.fire('Erreur', 'Une erreur est survenue. Veuillez réessayer SVP!', 'error')
      .then(res => {
        if (res) this.loading = false
      });
  }

}
