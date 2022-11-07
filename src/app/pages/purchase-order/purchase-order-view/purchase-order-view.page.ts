import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseOrderInterface } from '@app/interfaces/purchase-order.interface';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-purchase-order-view',
  templateUrl: './purchase-order-view.page.html',
  styleUrls: ['./purchase-order-view.page.scss'],
})
export class PurchaseOrderViewPage implements OnInit {
  public purchaseOrderUuid: string;

  public entries = [{
    'supplier_name': 'MGM',
    'description': 'Door',
    'quantity': 4,
    'left': 4,
    'received_qty': 0
  },{
    'supplier_name': 'MGM',
    'description': 'Window',
    'quantity': 10,
    'left': 7,
    'received_qty': 0
  }]

  constructor(private activatedRoute: ActivatedRoute, private navController: NavController, private router: Router) {
    this.activatedRoute.paramMap.subscribe(async params => {
      this.purchaseOrderUuid = params.get('purchaseOrderUuid');
    });
  }

  ngOnInit() {
  }

  onCancelClick() {
    this.navController.back();
  }

  onSaveClick() {
    this.navController.back();
  }

  subQty(entry: any) {
    if(entry.received_qty > 0) {
      entry.received_qty = entry.received_qty - 1;
    }

    console.log('entry', entry);
  }

  addQty(entry: any) {
    if(entry.received_qty < entry.left) {
      entry.received_qty = entry.received_qty + 1;
    }

    console.log('entry', entry);
  }
}
