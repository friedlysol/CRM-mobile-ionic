import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { WorkOrderRoutingModule } from './work-order.routing.module';
import { WorkOrderListPage } from './work-order-list/work-order-list.page';
import { SharedModule } from '@app/shared.module';
import { WorkOrderViewPage } from '@app/pages/work-order/work-order-view/work-order-view.page';
import { LaunchNavigator } from '@awesome-cordova-plugins/launch-navigator/ngx';
import { CalendarViewsListPage } from './calendar-views/calendar-views-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    WorkOrderRoutingModule
  ],
  declarations: [WorkOrderListPage, WorkOrderViewPage, CalendarViewsListPage],
  providers: [LaunchNavigator]
})
export class  WorkOrderModule {}
