import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PaygateService} from '../../../services/paygate.service';

@Component({
  selector: 'app-response',
  templateUrl: './paygate-response.component.html',
  styleUrls: ['./paygate-response.component.css']
})
export class PaygateResponseComponent implements OnInit {

  private paygateId: string;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private paygateService: PaygateService) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.paygateId = params.get('transaction_id');
      if (this.paygateId === null || this.paygateId === undefined || this.paygateId.length <= 0) {
        this.paygateId = sessionStorage.getItem('paygate_trx_id');
      }
    });
  }

  async ngOnInit() {
    const flag = sessionStorage.getItem('flag');
    const headerHeight = $('header')[0].offsetHeight;
    const footerHeight = $('footer')[0].offsetHeight;
    const pageHeight = window.innerHeight;
    $('#loader')[0].style.height = pageHeight - headerHeight - footerHeight + 'px';
    if (flag === 'flight') {
      const response = await this.paygateService.checkTransactionStatus(this.paygateId);
      if (response !== null && response !== undefined && response.payment.status.equalIgnoreCase('success')) {
        this.router.navigate(['print', 'flight'], {queryParams: {ref: response.order_ref}}).then();
      }
    }
  }

}
