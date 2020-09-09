import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {FlightSearchRoutingModule} from './flight-search-routing.module';
import {SearchComponent} from '../../flights/search/search.component';
import {FilterComponent} from '../../flights/filter/filter.component';
import {PreviewComponent} from '../../flights/preview/preview.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NgxPaginationModule} from 'ngx-pagination';
import {FormsModule} from '@angular/forms';
import {NgxSliderModule} from '@m0t0r/ngx-slider';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {UpdateSearchComponent} from '../../flights/update-search/update-search.component';
import {DpDatePickerModule} from 'ng2-date-picker';

@NgModule({
  declarations: [
    SearchComponent,
    FilterComponent,
    PreviewComponent,
    UpdateSearchComponent
  ],
  imports: [
    CommonModule,
    FlightSearchRoutingModule,
    MatTooltipModule,
    NgxPaginationModule,
    FormsModule,
    NgxSliderModule,
    MatButtonToggleModule,
    DpDatePickerModule
  ]
})
export class FlightSearchModule {
}
