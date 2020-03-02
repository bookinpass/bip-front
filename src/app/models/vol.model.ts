import {Time} from "@angular/common";
import {CompagnieModel} from "./compagnie.model";
import {AircraftModel} from "./aircraft.model";

export class VolModel {
  codeVol: string;
  flightNumber: string;
  flightDate: Date;
  departure: Time;
  arrival: Time;
  flightDuration: Time;
  stopoverDuration: string;
  daysOfStopover: number;
  fromAirportIata: string;
  toAirportIata: string;
  fromAirportGate: string;
  toAirportGate: string;
  compagnie: CompagnieModel;
  flightType: AircraftModel;
}
