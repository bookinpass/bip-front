import {FlightOfferModel} from "./flight-offer.model";
import {ContactModel, TravelerModel} from "./traveler.model";

export interface AssociatedRecordsModel {
  reference: string; // Record locator [Amadeus or OA] with which the current reservation is related. In case of a codeshare relation,
  // it enables to identify the operating PNR.
  creationDate: string; // Creation date of the referenced reservation. Date and time in ISO8601 YYYY-MM-ddThh:mm:ss.sss format,
  // e.g. 2019-07-09T12:30:00.000
  originSystemCode: string; // min=2, max=2 Designates the system which has originated the referenced reservation.
  flightOfferId: string; // id of the impacted flight offer
}

export interface GeneralRemarkModel {
  subtype: string; // general remark type [ GENERAL_MISCELLANEOUS, CONFIDENTIAL, INVOICE, QUALITY_CONTROL, BACKOFFICE, FULFILLMENT,
  // ITINERARY, TICKETING_MISCELLANEOUS ]
  category: string; // pattern: [A-Z]{1} remark category
  travelersIds: string[]; // Id of the concerned traveler
  text: string; // remark free text
  flightOffersIds: string[]; // Id of the concern flightOffers
}

export interface AirlineRemarkModel {
  subtype: string; // airline remark type [ OTHER_SERVICE_INFORMATION, KEYWORD, OTHER_SERVICE, CLIENT_ID ]
  keyword: string; // keyword code - only applicable for subType Keyword
  airlineCode: string; // Code of the airline following IATA standard (IATA table codes). When it apply to any airline, value is YY.
  travelersIds: string[]; // Id of the concerned traveler
  text: string; // remark free text
  flightOffersIds: string[]; // Id of the concern flightOffers
}

export interface RemarkModel {
  general: Array<GeneralRemarkModel>; // list of general remarks
  airline: Array<AirlineRemarkModel>; // list of airline remarks
}

interface ReportingDataModel {
  name: string;
  value: string;
}

interface VirtualCreditCardModel {
  brand: string; // credit card brand [ VISA, AMERICAN_EXPRESS, MASTERCARD, VISA_ELECTRON, VISA_DEBIT, MASTERCARD_DEBIT, MAESTRO, DINERS ]
  holder: string; // card holder as on the card
  number: string; // pattern: [a-zA-Z0-9]{1,35} card number
  expiryDate: string; // credit card expiration date following ISO 8601 (YYYY-MM format, e.g. 2012-08)
  amount: string; // Amount of the fare. could be alpha numeric. Ex- 500.20 or 514.13A, 'A'signifies additional collection.
  currencyCode: string; // Currency type of the fare.
}

interface B2bWalletModel {
  cardId: string;
  cardUsageName: string; // card usage name
  cardFriendlyName: string; // pattern: [a-zA-Z0-9]{1,35} card name
  reportingData: Array<ReportingDataModel>;
  virtualCreditCardDetails: VirtualCreditCardModel; // detail information of the virtual card
  flightOfferIds: string[]; // Id of the concern flightOffers min 1 max 6
}

interface CreditCardModel {
  brand: string; // credit card brand [ VISA, AMERICAN_EXPRESS, MASTERCARD, VISA_ELECTRON, VISA_DEBIT, MASTERCARD_DEBIT, MAESTRO, DINERS ]
  holder: string; // card holder as on the card
  number: string; // pattern: [a-zA-Z0-9]{1,35} card number
  expiryDate: string; // credit card expiration date following ISO 8601 (YYYY-MM format, e.g. 2012-08)
  security: string; // card security code
  flightOfferIds: string[]; // Id of the concern flightOffers min 1 max 6
}

interface OtherPaymentModel {
  method: string; // other payment method [ ACCOUNT, CHECK, CASH, NONREFUNDABLE ]
  flightOfferIds: string[]; // Id of the concern flightOffers min 1 max 6
}

interface FormOfPaymentModel {
  b2bWallet: B2bWalletModel;
  creditCard: CreditCardModel;
  other: OtherPaymentModel; // other payment method
}

interface TicketingAgreementModel {
  option: string; // ticketing agreement option [ CONFIRM, DELAY_TO_QUEUE, DELAY_TO_CANCEL, AIRLINE_UNTICKETED_CANCELATION ]
  delay: string; // Delay before applying automatic process if no issuance in days
  dateTime: string; // Exact date to apply automatic process if no issuance. YYYY-MM-DD format, e.g. 2019-06-07
  segmentIds: string[]; // Ids of the impacted segments
}

interface QueueModel {
  number: string;
  category: string;
}

interface AutomatedProcessModel {
  code: string; // queuing action to be taken [ IMMEDIATE, DELAYED, ERROR ]
  queue: QueueModel; // Identifies the queue onto which PNR must be automatically placed upon process execution.
  text: string; // free text
  delay: string; // Delay before applying process in days
  officeId: string; // Office into which the process must be triggered.
  dateTime: string; // Datetime limit at which the process takes action in case issuance is not done.
}

interface CreateOrderContactModel extends ContactModel{
  companyName: string; // Name of the company
  emailAddress: string; // Email address (e.g. john@smith.com)
}

interface AirTravelDocumentModel {
  documentType: string; // Type of the travel document [ ETICKET, PTICKET, EMD, MCO ]
  documentNumber: string; // Identifier of the travel document prefixed by its owner code [NALC - 3 digits]. Can either be a primary or
  // a conjunctive document number. Necessary for TicketingReference definition.
  documentStatus: string; // Status of the travel document contained in the fare element [ ISSUED, REFUNDED, VOID, ORIGINAL, EXCHANGED ]
  travelerId: string; // id of the impacted traveler
  segmentIds: string[]; // Ids of the impacted segments
}

export interface FlightCreateOrderModel {
  type: string;
  id?: string; // unique identifier of the flight order
  queuingOfficeId?: string; // office Id where to queue the order
  ownerOfficeId?: string; // office Id where will be transferred the ownership of the order
  associatedRecords?: Array<AssociatedRecordsModel>; // list of associated record
  flightOffers: Array<FlightOfferModel>; // list of flight offer
  travelers?: Array<TravelerModel>; // list of travelers
  remarks?: RemarkModel; // remarks
  formOfPayments?: Array<FormOfPaymentModel>;
  ticketingAgreement?: TicketingAgreementModel;
  automatedProcess?: AutomatedProcessModel; // list of automatic queuing
  contacts?: Array<CreateOrderContactModel>;
  tickets?: Array<AirTravelDocumentModel>; // ticket information
}
