import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { WorkOrderRoutingModule } from './work-order.routing.module';
import { WorkOrderListPage } from './work-order-list/work-order-list.page';
import { SharedModule } from '@app/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    WorkOrderRoutingModule
  ],
  declarations: [WorkOrderListPage],
})
export class  WorkOrderModule {}
