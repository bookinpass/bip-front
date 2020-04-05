export class EventTicketModel {
  codeTicket: string;
  ticketProviderCode: string;
  type: string;
  price: number;
  transactionNumber: string;
  isShared = false;
  eventId: string;
  ownerId: string;
}
