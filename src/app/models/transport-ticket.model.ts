import {Time} from '@angular/common';

export class TransportTicketModel {
  codeTicket: string;
  description: string;
  departDate: Date;
  departTime: Time;
  departLocation: string;
  arrivalLocation: string;
  ticketProviderCode: string;
  transportType: string;
  transactionNumber: string;
  transportName: string;
  transactionType: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  isScanned: boolean;
  scannedOn: Date;
  scannedAt: Time;
  isShared: false;
  sharingId: string;
  ownerId: number;
}
