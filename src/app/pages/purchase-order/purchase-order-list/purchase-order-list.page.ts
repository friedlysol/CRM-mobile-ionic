import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseOrderInterface } from '@app/interfaces/purchase-order.interface';

@Component({
  selector: 'app-purchase-order-list',
  templateUrl: './purchase-order-list.page.html',
  styleUrls: ['./purchase-order-list.page.scss'],
})
export class PurchaseOrderListPage implements OnInit {
  public assetUuid: string;
  public workOrderUuid: string;

  public query: string = null;

  public purchaseOrders: PurchaseOrderInterface[] = [
    {
      uuid: '1',
      purchase_order_number: 'PO-32748632',
      work_order_number: '1262',
      status: 'New',
    },
    {
      uuid: '1',
      purchase_order_number: 'PO-65432',
      work_order_number: '1',
      status: 'Reconciled',
    },
    {
      uuid: '1',
      purchase_order_number: 'PO-5235453',
      work_order_number: '2',
      status: 'New',
    }
  ];

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {
    this.activatedRoute.queryParamMap.subscribe(async params => {
      this.workOrderUuid = params.get('workOrderUuid');
      this.assetUuid = params.get('assetUuid');
    });
  }

  ngOnInit() {
  }

  onAddClick() {
    return this.router.navigate(['/purchase-order/form'], {
      queryParams: {
        workOrderUuid: this.workOrderUuid || '',
        assetUuid: this.assetUuid || ''
      }
    });
  }
}
