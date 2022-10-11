import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { WorkOrderRoutingModule } from './work-order.routing.module';
import { WorkOrderListPage } from './work-order-list/work-order-list.page';
import { SharedModule } from '@app/shared.module';
import { AddressComponent } from '@app/components/address/address.component';
import { WorkOrderViewPage } from '@app/pages/work-order/work-order-view/work-order-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    WorkOrderRoutingModule
  ],
  declarations: [WorkOrderListPage, WorkOrderViewPage, AddressComponent],
})
export class  WorkOrderModule {}
