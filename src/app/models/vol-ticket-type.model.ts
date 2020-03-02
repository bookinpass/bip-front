import {VolModel} from "./vol.model";

export class VolTicketTypeModel {

  volTicketTypeId: number;
  flightTicketClass: string;
  adultPrice: number;
  childPrice: number;
  totalSeats: number;
  availableSeats: number;
  numberOfFranchiseBags: number;
  franchiseBagWeight: number;
  handBagWeight: number;
  kitchenService: string;
  vol: VolModel
}
