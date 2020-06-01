interface LocationValue {
  cityCode: string; // City code associated to the airport
  countryCode: string; // Country code of the airport
}

export interface DictionaryModel {
  locations: { [key: string]: LocationValue };
  aircraft: { [key: string]: string };
  currency: { [key: string]: string };
  carriers: { [key: string]: string };
}
