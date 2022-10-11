import { Component, OnDestroy, OnInit } from '@angular/core';
import { WorkOrderService } from '@app/services/workorder.service';
import { ActivatedRoute } from '@angular/router';
import { WorkOrderInterface } from '@app/interfaces/work-order.interface';
import { AddressService } from '@app/services/address.service';
import { WorkOrderDatabase } from '@app/services/database/workorder.database';

@Component({
  selector: 'app-work-order-view',
  templateUrl: './work-order-view.page.html',
  styleUrls: ['./work-order-view.page.scss'],
})
export class WorkOrderViewPage implements OnInit, OnDestroy {
  public workOrder: WorkOrderInterface;

  private workOrderUuid: string;

  constructor(
    private route: ActivatedRoute,
    private workOrderDatabase: WorkOrderDatabase,
    private workOrderService: WorkOrderService,
    public addressService: AddressService
  ) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      this.workOrderUuid = params.get('workOrderUuid');
      this.workOrder = await this.workOrderDatabase.getByUuid(this.workOrderUuid);
    });
  }

  ngOnDestroy() {
  }
}
