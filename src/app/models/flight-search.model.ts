export class FlightSearchModel {
  from: string;
  to: string;
  departure: Date;
  return: Date;
  oneWay: boolean;
  nonStop = false;
  travelClass = 'ECONOMY';
  fromIata = '';
  toIata = '';
  adults = 1;
  children = 0;
  infants = 0;
  max = 100;
  currencyCode = 'XOF';
  includedAirlineCodes = '';
  excludedAirlineCodes = '';
}
