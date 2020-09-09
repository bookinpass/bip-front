export class FlightModel {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  disablePricing: boolean | null;
  nonHomogeneous: boolean;
  oneWay: boolean;
  paymentCardRequired?: null;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries?: (ItinerariesEntity)[] | null;
  price: Price;
  pricingOptions: PricingOptions;
  searchSegment: SearchSegment | null;
  validatingAirlineCodes?: (string)[] | null;
  travelerPricings: (TravelerPricingsEntity)[] | null;
}

export interface ItinerariesEntity {
  duration: string;
  segments?: (SegmentsEntity)[] | null;
}

export interface SegmentsEntity {
  departure: DepartureOrArrival;
  arrival: DepartureOrArrival;
  carrierCode: string;
  number: string;
  aircraft: Aircraft;
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

export interface SearchSegment {

}

export interface DepartureOrArrival {
  iataCode: string;
  terminal: string;
  at: Date;
}

export interface Aircraft {
  code: string;
}

export interface Price {
  currency: string;
  total: number;
  base: number;
  fees?: (FeesEntity)[] | null;
  grandTotal: number;
}

export interface FeesEntity {
  amount: number;
  type: string;
}

export interface PricingOptions {
  includedCheckedBagsOnly: boolean;
}

export interface TravelerPricingsEntity {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: Price1;
  fareDetailsBySegment?: (FareDetailsBySegmentEntity)[] | null;
}

export interface Price1 {
  currency: string;
  total: number;
  base: number;
  fees?: null;
  grandTotal: number;
}

export interface FareDetailsBySegmentEntity {
  segmentId: string;
  cabin: string;
  fareBasis: string;
  segmentClass: string;
  includedCheckedBags: IncludedCheckedBags;
}

export interface IncludedCheckedBags {
  weight: number;
  weightUnit?: null;
}

/*
export class FlightModel {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  disablePricing: boolean | null;
  nonHomogeneous: boolean;
  oneWay: boolean;
  paymentCardRequired?: boolean | null;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries?: ItinerariesEntity[] | null;
  price: ExtendedPrice;
  pricingOptions: PricingOptions;
  searchSegment: SearchSegment | null;
  validatingAirlineCodes: string[] | null;
  travelerPricing: TravelerPricingsEntity[] | null;
}

export class ItinerariesEntity {
  duration: string;
  segments: SegmentsEntity[] | null;
}

export class Tax {
  amount: string;
  code: string;
}

export class Price {
  currency: string;
  total: string;
  base: string;
  fees: Array<FeesEntity>;
  taxes: Array<Tax>;
  refundableTaxes: string; // The amount of taxes which are refundable
}


export class SegmentsEntity {
  departure: DepartureOrArrival;
  arrival: DepartureOrArrival;
  carrierCode: string;
  number: string;
  aircraft: Aircraft;
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

export class SearchSegment {

}

export class DepartureOrArrival {
  iataCode: string;
  terminal: string;
  at: Date;
}

export class Aircraft {
  code: string;
}

export class ExtendedPrice {
  currency: string;
  total: number;
  base: number;
  fees: FeesEntity[] | null;
  grandTotal: number;
  taxes: Tax[];
  refundableTaxes: string;
  margin: string;
  billingCurrency: string;
  additionalServices: AdditionalServices[];
}

export class AdditionalServices {
  amount: string;
  type: string; // additional service type = ['CHECKED_BAGS', 'MEALS', 'SEATS', 'OTHER_SERVICES']
}

export class FeesEntity {
  amount: number;
  type: string; // optional: type of fee = ['TICKETING', 'FORM_OF_PAYMENT', 'SUPPLIER']
}

export class PricingOptions {
  fareType: PricingOptionsFareType;
  corporateCode: string[];
  includedCheckedBagsOnly: boolean;
}

export class PricingOptionsFareType {
  types = ['PUBLISHED', 'NEGOTIATED', 'CORPORATE'];
}

export class TravelerPricingsEntity {
  travelerId: string;
  fareOption: string; // option specifying a group of fares, which may be valid under certain conditons Can be used to specify special
  // fare discount for a passenger = ['STANDARD', 'INCLUSIVE_TOUR', 'SPANISH_MELILLA_RESIDENT', 'SPANISH_CEUTA_RESIDENT',
  // 'SPANISH_CANARY_RESIDENT', 'SPANISH_BALEARIC_RESIDENT', 'AIR_FRANCE_METROPOLITAN_DISCOUNT_PASS', 'AIR_FRANCE_DOM_DISCOUNT_PASS',
  // 'AIR_FRANCE_COMBINED_DISCOUNT_PASS', 'AIR_FRANCE_FAMILY', 'ADULT_WITH_COMPANION', 'COMPANION'],
  travelerType: string; // traveler type age restrictions : CHILD < 12y, HELD_INFANT < 2y, SEATED_INFANT < 2y, SENIOR >=60y = ['ADULT',
  // 'CHILD', 'SENIOR', 'YOUNG', 'HELD_INFANT', 'SEATED_INFANT', 'STUDENT'],
  price: Price;
  fareDetailsBySegment?: (FareDetailsBySegmentEntity)[] | null;
}

export class AllotmentDetails {
  tourName: string;
  tourReference: string;
}

export class FareDetailsBySegmentEntity {
  segmentId: string;
  cabin: string; // quality of service offered in the cabin where the seat is located in this flight. Economy, premium economy, business
  // or first class = ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'],
  fareBasis: string; // Fare basis specifying the rules of a fare. Usually, though not always, is composed of the booking class code
  // followed by a set of letters and digits representing other characteristics of the ticket, such as refundability, minimum stay
  // requirements, discounts or special promotional elements. ,
  brandedFare: string; // The name of the Fare Family corresponding to the fares. Only for the GDS provider and if the airline has fare
  // families filled ,
  class: string; // The code of the booking class, a.k.a. class of service or Reservations/Booking Designator (RBD)
  segmentClass: string;
  isAllotment: boolean;
  allotmentDetails: AllotmentDetails;
  sliceDiceIndicator: string; // slice and Dice indicator, such as Local Availability, Sub OnD(Origin and Destination) 1 Availability and
  // Sub OnD 2 Availability = ['LOCAL_AVAILABILITY', 'SUB_OD_AVAILABILITY_1', 'SUB_OD_AVAILABILITY_2'],
  includedCheckedBags: IncludedCheckedBags;
  additionalServicesRequest: AdditionalServicesRequest;
}

export class IncludedCheckedBags {
  quantity: number;
  weight: number;
  weightUnit: string;
}

export class ServiceName {
  typeOfService = ['PRIORITY_BOARDING', 'AIRPORT_CHECKIN'];
}

export class AdditionalServicesRequest {
  chargeableCheckedBags: ChargeableCheckedBags;
  chargeableSeatNumber: string;
  otherServices: ServiceName[];
}

export class ChargeableCheckedBags {
  quantity: number;
  weight: number;
  weightUnit: string;
}
*/
