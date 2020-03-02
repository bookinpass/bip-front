import {PlaceModel} from './place.model';

export class EventSearchModel {
  date: Date;
  formattedDate: string;
  keyword: string[] = [];
  places: Set<PlaceModel> = new Set<PlaceModel>();
}
