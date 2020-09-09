import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-response',
  templateUrl: './paygate-response.component.html',
  styleUrls: ['./paygate-response.component.css']
})
export class PaygateResponseComponent implements OnInit {

  constructor(private router: Router) {
    console.log(router);
  }

  ngOnInit(): void {
  }

}
