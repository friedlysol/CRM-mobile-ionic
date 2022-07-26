import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { WorkOrderRoutingModule } from './work-order.routing.module';
import { WorkOrderListPage } from './work-order-list/work-order-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkOrderRoutingModule
  ],
  declarations: [WorkOrderListPage]
})
export class  WorkOrderModule {}
