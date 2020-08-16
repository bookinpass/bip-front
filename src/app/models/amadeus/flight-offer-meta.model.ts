interface CollectionLinksModel {
  self: string;
  next: string;
  previous: string;
  first: string;
  last: string;
  up: string;
}

export interface FlightOfferMetaModel {
  count: number;
  links: CollectionLinksModel;
}
