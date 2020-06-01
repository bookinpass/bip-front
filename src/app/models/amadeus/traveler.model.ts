export interface AddressModel {
  lines: string[]; // Line 1 = Street address, Line 2 = Apartment, suite, unit, building, floor, etc
  postalCode: string;
  countryCode: string; // country code ISO 3166-1 country code [a-zA-Z]{2}
  cityName: string; // [a-zA-Z -]{1,35} Full city name. Example: Dublin
  stateName: string; // Full state name
  postalBox: string;
}

export interface PhoneModel {
  deviceType: string; // Type of the device (Landline, Mobile or Fax) [ MOBILE, LANDLINE, FAX ]
  countryCallingCode: string; // [0-9+]{2,5} Country calling code of the phone number, as defined by the International Communication Union.
  // Examples - "1" for US, "371" for Latvia.
  number: string; // pattern: [0-9]{1,15} Phone number. Composed of digits only. The number of digits depends on the country.
}

export interface ContactModel {
  emailAddress: string;
  name?: NameModel;
  address?: AddressModel;
  purpose?: string; // the purpose for which this contact is to be used [ STANDARD, INVOICE, STANDARD_WITHOUT_TRANSMISSION ]
  phones?: Array<PhoneModel>; // max 3
  companyName?: string;
}

export interface EmergencyContactModel {
  addresseeName: string; // [a-zA-Z -] Adressee name (e.g. in case of emergency purpose it corresponds to name of the person to be contacted).
  countryCode: string; // pattern: [A-Z]{2} Country code of the country (ISO3166-1). E.g. "US" for the United States
  number: string; // pattern: [0-9]{1,15} Phone number. Composed of digits only. The number of digits depends on the country.
  text: string; // additional details
}

export interface LoyaltyProgram {
  programOwner: string; // loyalty program airline code
  id: string; // loyalty program number
}

export interface DiscountEligibilityModel {
  subType: string; // type of discount applied [ SPANISH_RESIDENT, AIR_FRANCE_DOMESTIC, AIR_FRANCE_COMBINED, AIR_FRANCE_METROPOLITAN ]
  cityName: string; // city of residence
  travelerType: string; // type of discount applied   [ SPANISH_CITIZEN, EUROPEAN_CITIZEN, GOVERNMENT_WORKER, MILITARY, MINOR_WITHOUT_ID ]
  cardNumber: string; // pattern: [0-9A-Z][0-9]{0,12}[A-Z] resident card number
  certificateNumber: string; // pattern: [0-9A-Z][0-9]{0,12}[A-Z] resident certificate number
}

export interface TravelerModel {
  id?: string;
  dateOfBirth?: string; // The date of birth in ISO 8601 format (yyyy-mm-dd)
  gender?: string; // [MALE, FEMALE]
  name?: NameModel; // name
  documents?: Array<DocumentModel>; // Advanced Passenger Information - regulatory identity documents - SSR DOCS & DOCO elements
  emergencyContact?: EmergencyContactModel; // emergency contact number
  loyaltyPrograms?: Array<LoyaltyProgram>; // loyalty program information
  discountEligibility?: Array<DiscountEligibilityModel>; // list of element that allow a discount.
  contact?: ContactModel; // contact information
}

export interface NameModel {
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface DocumentModel {
  number?: string; // The document number (shown on the document)
  issuanceDate?: string;
  expiryDate?: string;
  issuanceCountry: string; // ISO 3166-1 alpha-2 of the country that issued the document
  issuanceLocation?: string; // A more precise information concerning the place where the document has been issued, when available.
                            // It may be a country, a state, a city or any other type of location. e.g. New-York
  nationality: string; // ISO 3166-1 alpha-2 of the nationality appearing on the document
  birthPlace: string;
  documentType: string; // [ VISA, PASSPORT, IDENTITY_CARD, KNOWN_TRAVELER, REDRESS ]
  validityCountry?: string;
  birthCountry?: string;
  holder: boolean; // boolean to specify if the traveler is the holder of the document
}

