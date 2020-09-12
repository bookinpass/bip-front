import {FlightCreateOrderModel} from './flight-create-order.model';
import {DictionaryModel} from './dictionaryModel';

export interface FlightCreateOrderResponseModel {
  data: FlightCreateOrderModel;
  dictionaries: DictionaryModel;
}
