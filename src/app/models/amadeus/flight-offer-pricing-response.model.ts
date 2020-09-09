import {FlightOfferModel, TermAndConditionModel} from './flight-offer.model';
import {DictionaryModel} from './dictionaryModel';

export interface PassengerCondition {
  travelerId: string; // Id of the traveler
  genderRequired: boolean; // If true, the gender is required for the concerned traveler for the creation of the flight-order
  documentRequired: boolean; // If true, a document is required for the concerned traveler for the creation of the flight-order
  documentIssuanceCityRequired: boolean; // If true, the issuance city of the document is required for the concerned traveler for the
  // creation of the flight-order
  dateOfBirthRequired: boolean; // If true, the date of birth is required for the concerned traveler for the creation of the flight-order
  redressRequiredIfAny: boolean; // If true, the redress is required if any for the concerned traveler for the creation of the flight-order
  airFranceDiscountRequired: boolean; // If true, the Air France discount is required for the concerned traveler for the creation of the
  // flight-order
  spanishResidentDiscountRequired: boolean; // If true, the Spanish resident discount is required for the concerned traveler for the
  // creation of the flight-order
  residenceRequired: boolean; // If true, the address is required for the concerned traveler for the creation of the flight-order
}

export interface BookingRequirementModel {
  invoiceAddressRequired: boolean; // If true, an invoice address is required for the creation of the flight-order
  mailingAddressRequired: boolean; // If true, a postal address is required for the creation of the flight-order
  emailAddressRequired: boolean; // If true, an email address is required for the creation of the flight-order
  phoneCountryCodeRequired: boolean; // If true, the phone country code (e.g. '33') associated for each phone number is required for
  // the creation of the flight-order
  mobilePhoneNumberRequired: boolean; // If true, a mobile phone number is required for the creation of the flight-order
  phoneNumberRequired: boolean; // If true, a phone number is required for the creation of the flight-order
  postalCodeRequired: boolean; // If true, a postal code is required for the creation of the flight-order
  travelerRequirements: PassengerCondition[];
}

export interface FlightOfferPricingDataModel {
  bookingRequirements: BookingRequirementModel;
  flightOffers: FlightOfferModel[];
  type: string;
}

export interface CreditCardFeeModel {
  brand: string; // credit card brand [ VISA, AMERICAN_EXPRESS, MASTERCARD, VISA_ELECTRON, VISA_DEBIT, MASTERCARD_DEBIT, MAESTRO, DINERS,
  // MASTERCARD_IXARIS, VISA_IXARIS, MASTERCARD_AIRPLUS, UATP_AIRPLUS ]
  amount: string;
  currency: string;
  flightOfferId: string; // Id of the flightOffer concerned by the credit card fee
}

interface ElementaryPriceModel {
  amount: string; // Amount of the fare. could be alpha numeric. Ex- 500.20 or 514.13A, 'A'signifies additional collection.
  currencyCode: string; // Currency type of the fare.
}

interface BagModel {
  quantity: number; // total number of units
  weight: number; // Weight of the baggage allowance
  weightUnit: string; // Code to qualify unit as pounds or kilos
  name: string; // Type of service
  price: ElementaryPriceModel;
  bookableByItinerary: boolean; // Specify if the service is bookable by itinerary or for all itineraries
  segmentIds: string[]; // Id of the segment concerned by the service
  travelerIds: string[]; // Id of the traveler concerned by the service
}

interface ServiceModel {
  name: string; // type of service [ PRIORITY_BOARDING, AIRPORT_CHECKIN ]
  price: ElementaryPriceModel;
  bookableByTraveler: boolean; // Specify if the service is bookable by traveler or for all travelers
  bookableByItinerary: boolean; // Specify if the service is bookable by itinerary or for all itineraries
  segmentIds: string[]; // Id of the segment concerned by the service
  travelerIds: string[]; // Id of the traveler concerned by the service
}

export interface DetailedFareRuleModel {
  fareBasis: string;
  name: string;
  fareNotes: TermAndConditionModel;
  segmentId: string; // Id of the segment concerned by the fare rule
}

export interface IncludedResourceModel {
  'credit-card-fees': CreditCardFeeModel; // Map of fee applied by credit card brand
  bags: BagModel; // Map of fee applied by bag option
  'other-services': ServiceModel; // Map of fee applied by service
  'detailed-fare-rules': DetailedFareRuleModel;
}

export interface FlightOfferPricingResponseModel {
  data: FlightOfferPricingDataModel;
  dictionaries: DictionaryModel;
  included: IncludedResourceModel;
}
