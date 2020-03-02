export class FlightFilterModel {
  minBudget = 0;
  maxBudget = 0;
  connectingAirport = new Set<string>();
  selectedCompanies = new Set<string>();
}
