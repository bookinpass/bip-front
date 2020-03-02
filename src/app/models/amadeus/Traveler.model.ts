export class TravelerModel {
  id: string; // optional
  dateOfBirth = ''; // optional: The date of birth in ISO 8601 format (yyyy-mm-dd)
  gender = ''; // optional: The gender = ['MALE', 'FEMALE']
  name = new NameModel(); // optional
  documents = new IdentityDocumentModel(); // optional
  // emergencyContact (EmergencyContact, optional):
  loyaltyPrograms = new Array<LoyaltyProgramModel>(); // optional: list of loyalty program followed by the traveler ,
  discountEligibility = new Array<DiscountModel>(); // optional: list of element that allow a discount
  contact = new ContactModel(); // optional
}

class NameModel {
  firstName = '';
  lastName = '';
  middleName: string;
  secondLastName: string;
}

class IdentityDocumentModel {
  number = ''; // optional
  issuanceDate = ''; // optional
  expiryDate = ''; // optional
  issuanceCountry = ''; // optional: ISO 3166-1 alpha-2 of the country that issued the document
  issuanceLocation = ''; // optional: A more precise information concerning the place where the document has been issued, when available.
  // It may be a country, a state, a city or any other type of location. e.g. New-York
  nationality: string; // optional: ISO 3166-1 alpha-2 of the nationality appearing on the document
  birthPlace = ''; // optional
  documentType = ''; // optional: the nature/type of the document = ['VISA', 'PASSPORT', 'IDENTITY_CARD', 'KNOWN_TRAVELER', 'REDRESS']
  validityCountry: string; // optional: ISO 3166-1 alpha-2 of the country where the documents is valid
  birthCountry = ''; // optional: ISO 3166-1 alpha-2 of the country of birth
  holder: boolean; // optional: boolean to specify if the traveler is the holder of the documents
}

class LoyaltyProgramModel {
  programOwner: string; // optional: loyalty program airline code
  id: string; // optional: loyalty program number
}

class DiscountModel {
  subType: string; // optional: type of discount applied = ['SPANISH_RESIDENT', 'AIR_FRANCE_DOMESTIC', 'AIR_FRANCE_COMBINED',
  // 'AIR_FRANCE_METROPOLITAN'],
  cityName: string; // optional: city of residence ,
  travelerType: string; // optional: type of discount applied = ['SPANISH_CITIZEN', 'EUROPEAN_CITIZEN', 'GOVERNMENT_WORKER', 'MILITARY',
  // 'MINOR_WITHOUT_ID'],
  cardNumber: string; // optional: resident card number ,
  certificateNumber: string; // optional: resident certificate number
}

class ContactModel {
  addresseeName = new NameModel(); // optional: the name of the person addressed by these contact details ,
  address = new AddressModel(); // optional
  purpose: string; // optional: the purpose for which this contact is to be used = ['STANDARD', 'INVOICE'],
  phones = new Array<PhoneModel>(); // optional: Phone numbers ,
  companyName: string; // optional: Name of the company ,
  emailAddress = ''; // optional: Email address (e.g. john@smith.com)
}

export class PhoneModel {
  deviceType: string; // optional: Type of the device (Landline, Mobile or Fax) = ['MOBILE', 'LANDLINE', 'FAX']
  countryCallingCode = ''; // optional: Country calling code of the phone number, as defined by the International Communication Union.
  // Examples - "1" for US, "371" for Latvia.
  number = ''; // optional
}

class AddressModel {
  lines = new Array<string>(''); // optional:Line 1 = Street address, Line 2 = Apartment, suite, unit, building, floor, etc ,
  postalCode = ''; // optional
  countryCode = ''; // optional: country code ISO 3166-1 country code ,
  cityNam = ''; // optionalL Full city name. Example: Dublin ,
  stateName = ''; // optional: Full state name ,
  postalBox: string; // optional
}
