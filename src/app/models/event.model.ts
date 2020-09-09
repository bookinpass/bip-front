import {Time} from '@angular/common';
import {OrganiserModel} from './organiser.model';
import {PlaceModel} from './place.model';
import {PricingModel} from './pricing.model';

export class EventModel {
  eventId: string;
  designation: string;
  description: string;
  imageTimestamp: string;
  mainType: string;
  eventType: string;
  eventState: string;
  startingDate: Date;
  endingDate: Date;
  startingTime: Time;
  endingTime: Time;
  organiser: OrganiserModel;
  place: PlaceModel;
  tarification: PricingModel[];
}
