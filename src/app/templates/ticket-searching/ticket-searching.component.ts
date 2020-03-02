import {Component, OnDestroy, OnInit} from '@angular/core';
import {VariableConfig} from '../../../assets/variable.config';
import {FuiLocalizationService} from 'ngx-fomantic-ui';
import fr from 'ngx-fomantic-ui/locales/fr';
import {faBasketballBall, faBusAlt, faFutbol, faPlane, faShip} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-ticket-searching',
    templateUrl: './ticket-searching.component.html',
    styleUrls: ['./ticket-searching.component.css']
})
export class TicketSearchingComponent implements OnDestroy, OnInit {

    public faPlane = faPlane;
    public faShip = faShip;
    public faBus = faBusAlt;
    public faFoot = faFutbol;
    public faBasketBall = faBasketballBall;

    public selectedOption = 1;
    public selectedTransport = 1;
    public selectedSport = 1;
    public loading = false;
    public variableConfig: VariableConfig = new VariableConfig();

    constructor(public localizationService: FuiLocalizationService) {
        // Start by choosing a "fallback" language,
        // i.e. which language to use if you don't provide a certain value.
        localizationService.load('fr', fr);
        // Finally, update the current language:
        localizationService.setLanguage('fr');
        localStorage.removeItem('search_ticket');
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
    }

}
