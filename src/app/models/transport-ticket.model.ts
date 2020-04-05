import {Time} from '@angular/common';

export class TransportTicketModel {
  idTicket: string;
  description: string;
  departDate: Date;
  departTime: Time;
  departLocation: string;
  arrivalLocation: string;
  ticketProviderCode: string;
  transportType: string;
  orderId: string;
  transportName: string;
  totalPrice: number;
  createdAt: Date;
  isScanned: boolean;
  scannedOn: Date;
  scannedAt: Time;
  isShared: false;
  sharingId: string;
}
