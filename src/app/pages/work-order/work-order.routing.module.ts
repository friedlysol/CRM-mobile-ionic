import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkOrderListPage } from './work-order-list/work-order-list.page';
import { WorkOrderViewPage } from '@app/pages/work-order/work-order-view/work-order-view.page';

const routes: Routes = [
  {
    path: 'list',
    component: WorkOrderListPage
  },
  {
    path: 'view/:workOrderUuid',
    component: WorkOrderViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkOrderRoutingModule {}
