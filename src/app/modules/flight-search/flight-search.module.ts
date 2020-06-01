import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {FlightSearchRoutingModule} from './flight-search-routing.module';
import {SearchComponent} from '../../flights/search/search.component';
import {FilterComponent} from '../../flights/filter/filter.component';
import {PreviewComponent} from '../../flights/preview/preview.component';


@NgModule({
  declarations: [
    SearchComponent,
    FilterComponent,
    PreviewComponent
  ],
  imports: [
    CommonModule,
    FlightSearchRoutingModule
  ]
})
export class FlightSearchModule {
}
