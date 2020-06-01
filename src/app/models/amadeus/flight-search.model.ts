export interface FlightSearchModel {
  from: string;
  to: string;
  departDate: Date;
  returnDate: Date;
  nonStop?: boolean;
  travelClass: string;
  adults: number;
  children?: number;
  infants?: number;
  max?: number;
  currencyCode?: string;
  includedAirlineCodes?: string;
  excludedAirlineCodes?: string;
}
