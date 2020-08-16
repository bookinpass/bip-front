import {FlightOfferMetaModel} from './flight-offer-meta.model';
import {FlightOfferModel} from './flight-offer.model';
import {DictionaryModel} from './dictionaryModel';

export interface FlightOfferResponseModel {
  meta: FlightOfferMetaModel;
  data: Array<FlightOfferModel>;
  dictionaries: DictionaryModel;
}
