export interface FlightEndPointModel {
  iataCode: string;
  terminal: string;
  at: string; // local date and time in ISO8601 YYYY-MM-ddThh:mm:ss format, e.g. 2017-02-10T20:40:00
}

export interface AircraftEquipmentModel {
  code: string; // IATA aircraft code (http://www.flugzeuginfo.net/table_accodes_iata_en.php)
}

export interface OperatingFlightModel {
  carrierCode: string; // providing the airline / carrier code
}

export interface FlightStopModel {
  iataCode: string;
  duration: string; // stop duration in ISO8601 PnYnMnDTnHnMnS format, e.g. PT2H10M
  arrivalAt: string; // arrival at the stop in ISO8601 YYYY-MM-ddThh:mm:ss format, e.g. 2017-02-10T20:40:00
  departureAt: string; // departure from the stop in ISO8601 YYYY-MM-ddThh:mm:ss format, e.g. 2017-02-10T20:40:00
}

export interface SegmentModel {
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean; // When the flight has a marketing or/and operating airline that is identified as blacklisted by the European Commission.
  departure: FlightEndPointModel; // departure or arrival information
  arrival: FlightEndPointModel; // departure or arrival information
  carrierCode: string; // providing the airline / carrier code
  number: string; // the flight number as assigned by the carrier
  aircraft: AircraftEquipmentModel; // information related to the aircraft
  operating: OperatingFlightModel; // information about the operating flight
  duration: string; // stop duration in ISO8601 PnYnMnDTnHnMnS format, e.g. PT2H10M
  stops: Array<FlightStopModel>; // information regarding the different stops composing the flight segment. E.g. technical stop, change of gauge...
}

export interface ItineraryModel {
  duration: string; // duration in ISO8601 PnYnMnDTnHnMnS format, e.g. PT2H10M for a duration of 2h10m
  segments: Array<SegmentModel>; // defining a flight segment; including both operating and marketing details when applicable
}

export interface FeesModel {
  amount: string;
  type: string; // type of fee [ TICKETING, FORM_OF_PAYMENT, SUPPLIER ]
}

export interface TaxesModel {
  amount: string;
  code: string;
}

export interface AdditionalServices {
  amount: string;
  type: string; // additional service type [ CHECKED_BAGS, MEALS, SEATS, OTHER_SERVICES ]
}

export interface PriceModel {
  margin: string; // BOOK step ONLY - The price margin percentage (plus or minus) that the booking can tolerate. When set to 0, then no price magin is tolerated.
  grandTotal: string; // Total amount paid by the user (including fees and selected additional services).
  billingCurrency: string; // Currency of the payment. It may be different than the requested currency
  additionalServices: Array<AdditionalServices>;
  currency: string;
  total: string; // Total amount paid by the user
  base: string; // Amount without taxes
  fees: Array<FeesModel>; // List of applicable fees
  taxes: Array<TaxesModel>; // List of taxes
  refundableTaxes: string; // The amount of taxes which are refundable
}

export interface PricingOptionsModel {
  fareType: string[]; // type of fare of the flight-offer [ PUBLISHED, NEGOTIATED, CORPORATE ]
  corporateCodes: string[]; // Allow Corporate negotiated fares using one or more corporate number (corporate code).
  includedCheckedBagsOnly: boolean; // If true, returns the flight-offers with included checked bags only
  refundableFare: boolean; // If true, returns the flight-offers with refundable fares only
  noRestrictionFare: boolean; // If true, returns the flight-offers with no restriction fares only
  noPenaltyFare: boolean; // If true, returns the flight-offers with no penalty fares only
}

interface AllotmentDetailsModel {
  tourName: string;
  tourReference: string;
}

export interface BaggageAllowanceModel {
  quantity: number; // Total number of units
  weight: number; // Weight of the baggage allowance
  weightUnit: string; // Code to qualify unit as pounds or kilos
}

export interface AdditionalServicesRequest {
  chargeableCheckedBags: BaggageAllowanceModel;
  chargeableSeatNumber: string; // seat number
  otherServices: string[]; // service name [ PRIORITY_BOARDING, AIRPORT_CHECKIN ]
}

export interface FareDetailsBySegmentModel {
  segmentId: string;
  cabin: string; // quality of service offered in the cabin where the seat is located in this flight. Economy, premium economy, business
  // or first class [ ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST ]
  fareBasis: string; // Fare basis specifying the rules of a fare. Usually, though not always, is composed of the booking class code
  // followed by a set of letters and digits representing other characteristics of the ticket, such as refundability, minimum stay
  // requirements, discounts or special promotional elements.
  brandedFare: string; // The name of the Fare Family corresponding to the fares. Only for the GDS provider and if the airline has fare families filled
  class: string; // The code of the booking class, a.k.a. class of service or Reservations/Booking Designator (RBD)
  isAllotment: string; // True if the corresponding booking class is in an allotment
  allotmentDetails: AllotmentDetailsModel;
  sliceDiceIndicator: string; // slice and Dice indicator, such as Local Availability, Sub OnD(Origin and Destination) 1 Availability and
  // Sub OnD 2 Availability [ LOCAL_AVAILABILITY, SUB_OD_AVAILABILITY_1, SUB_OD_AVAILABILITY_2 ]
  includedCheckedBags: BaggageAllowanceModel;
  additionalServices: AdditionalServicesRequest;
}

export interface TravelerPricingModel {
  travelerId: string;
  fareOption: string; // option specifying a group of fares, which may be valid under certain conditons. Can be used to specify special
  // fare discount for a passenger[ STANDARD, INCLUSIVE_TOUR, SPANISH_MELILLA_RESIDENT, SPANISH_CEUTA_RESIDENT, SPANISH_CANARY_RESIDENT,
  // SPANISH_BALEARIC_RESIDENT, AIR_FRANCE_METROPOLITAN_DISCOUNT_PASS, AIR_FRANCE_DOM_DISCOUNT_PASS, AIR_FRANCE_COMBINED_DISCOUNT_PASS,
  // AIR_FRANCE_FAMILY, ADULT_WITH_COMPANION, COMPANION ]
  travelerType: string; // traveler type age restrictions : CHILD < 12y, HELD_INFANT < 2y, SEATED_INFANT < 2y, SENIOR >=60y
  // [ ADULT, CHILD, SENIOR, YOUNG, HELD_INFANT, SEATED_INFANT, STUDENT ]
  associatedAdultId: string // if type="HELD_INFANT", corresponds to the adult traveler's id who will share the seat
  price: PriceModel;
  fareDetailsBySegment: Array<FareDetailsBySegmentModel>; // Fare details of the segment
}

export interface DescriptionModel {
  descriptionType: string;
  text: string;
}

export interface TermAndConditionModel {
  category: string; // This defines what type of modification is concerned in this rule. [ REFUND, EXCHANGE, REVALIDATION, REISSUE, REBOOK, CANCELLATION ]
  circumstances: string;
  notApplicable: boolean;
  maxPenaltyAmount: string;
  descriptions: Array<DescriptionModel>;
}

export interface FareRuleModel {
  currency: string; // The currency of the penalties
  rules: Array<TermAndConditionModel>;
}

export interface FlightOfferModel {
  type: string;
  example; // flight-offer the resource name
  id: string;
  source: string; // GDS
  instantTicketingRequired: boolean; // If true, inform that a ticketing will be required at booking step.
  disablePricing: boolean; // BOOK step ONLY - If true, allows to book a PNR without pricing. Only for the source "GDS"
  nonHomogeneous: boolean; // If true, upon completion of the booking, this pricing solution is expected to yield multiple records
  // (a record contains booking information confirmed and stored, typically a Passenger Name Record (PNR), in the provider GDS or system)
  oneWay: boolean; // If true, the flight offer fulfills only one originDestination and has to be combined with other oneWays to complete the whole journey.
  paymentCardRequired: boolean; // If true, a payment card is mandatory to book this flight offer
  lastTicketingDate: string; // If booked on the same day as the search (with respect to timezone), this flight offer is guaranteed to be
  // thereafter valid for ticketing until this date (included). Unspecified when it does not make sense for this flight offer
  // (e.g. no control over ticketing once booked). YYYY-MM-DD format, e.g. 2019-06-07
  numberOfBookableSeats: number; // Number of seats bookable in a single request. Can not be higher than 9.
  itineraries: Array<ItineraryModel>;
  price: PriceModel; // price information
  pricingOptions: PricingOptionsModel;
  validatingAirlineCodes: string[]; // This option ensures that the system will only consider these airlines.
  travelerPricings: Array<TravelerPricingModel>; // Fare information for each traveler/segment
  fareRules: FareRuleModel
}
