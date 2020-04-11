export class TicketEventModel {
  codeTicket: string;
  ticketProviderCode: string;
  type: string;
  totalPrice: number;
  transactionNumber: string;
  isShared = false;
  eventId: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
