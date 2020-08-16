import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DictionaryModel, LocationValue} from '../../models/amadeus/dictionaryModel';
import Swal from 'sweetalert2';
import {LabelType, Options} from '@m0t0r/ngx-slider';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

  @Output() filterPrice = new EventEmitter<Map<string, number>>();
  @Output() filterAirlines = new EventEmitter<string>();
  @Output() filterStops = new EventEmitter<boolean>();
  @Input() dictionary: DictionaryModel;
  @Input() priceRange: { min: number, max: number };

  public locations: { [key: string]: LocationValue };
  public aircraft: { [key: string]: string };
  public carriers = new Array<string>();
  public filteredCarriers = new Array<string>();

  public minValue: number;
  public maxValue: number;
  public options: Options;
  public stop: boolean;

  constructor() {
  }

  ngOnInit(): void {
    this.enableAccordions()
    this.setDictionaryDetails();
    this.minValue = this.priceRange.min;
    this.maxValue = this.priceRange.max;
    this.options = {
      floor: this.priceRange.min,
      ceil: this.priceRange.max,
      translate: (value: number, label: LabelType): string => {
        switch (label) {
          case LabelType.Low:
            return '<b>Prix min:</b> ' + value;
          case LabelType.High:
            return '<b>Prix max:</b> ' + value;
          default:
            return '$' + value;
        }
      }
    };
  }

  public updateCarrier = (item: string) => this.filteredCarriers.includes(item) ?
    this.filteredCarriers.splice(this.filteredCarriers.indexOf(item), 1) : this.filteredCarriers.push(item);

  public doFilter = (type: string) => {
    switch (type.toLowerCase()) {
      case 'prices':
        this.doPriceFilter();
        break;
      case 'airlines':
        this.doAirlinesFilter();
        break;
      default:
        this.swalError('Aucun filtre selectionner!');
    }
  }

  private swalError = (msg: string) => {
    Swal.fire({title: 'Error', html: msg, icon: 'error', timer: 3000, showConfirmButton: false, timerProgressBar: true}).then();
  }

  private doPriceFilter() {
    if (this.minValue === this.maxValue) this.swalError('Les bornes de la plage des prix ne peuvent etre egales!');
    else {
      const filter = new Map<string, number>();
      if (this.minValue > this.priceRange.min) filter.set('min', this.minValue);
      if (this.maxValue < this.priceRange.max) filter.set('max', this.maxValue);
      this.filterPrice.emit(filter);
    }
  }

  private doAirlinesFilter() {
    if (this.filteredCarriers.length === 0) this.swalError('Au moins une compagnie doit etre selectionne!');
    else if (this.filteredCarriers.length === this.carriers.length) this.swalError('Aucun filtre selectionner!');
    else this.filterAirlines.emit(this.filteredCarriers.join(',').trim().toString());
  }

  private setDictionaryDetails() {
    this.locations = this.dictionary.locations;
    // tslint:disable-next-line:forin
    for (const key in this.dictionary.carriers) {
      this.carriers.push(key);
      this.filteredCarriers.push(key);
    }
    this.aircraft = this.dictionary.aircraft;
  }

  private enableAccordions = () => {
    $('.ui.accordion > .title').on('click', e => {
      const item = e.target;
      if (item.classList.contains('active')) {
        item.classList.remove('active');
        // @ts-ignore
        item.nextSibling.classList.remove('active');
      } else {
        item.classList.add('active');
        // @ts-ignore
        item.nextSibling.classList.add('active');
      }
    });
  }
}
