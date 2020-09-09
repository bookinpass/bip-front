import {Component} from '@angular/core';
import {faBasketballBall, faBusAlt, faFutbol, faPlane, faShip} from '@fortawesome/free-solid-svg-icons';
import {VariableConfig} from '../../../assets/variable.config';

@Component({
  selector: 'app-ticket-searching',
  templateUrl: './ticket-searching.component.html',
  styleUrls: ['./ticket-searching.component.css']
})
export class TicketSearchingComponent {

  public faPlane = faPlane;
  public faShip = faShip;
  public faBus = faBusAlt;
  public faFoot = faFutbol;
  public faBasketBall = faBasketballBall;

  public selectedOption = 1;
  public selectedTransport = 1;
  public selectedSport = 1;
  public loading = false;
  public variableConfig = new VariableConfig();

  constructor() {
    localStorage.removeItem('search_ticket');
  }

}
