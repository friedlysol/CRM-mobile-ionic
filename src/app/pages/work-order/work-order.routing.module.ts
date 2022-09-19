import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkOrderListPage } from './components/work-order-list/work-order-list.page';

const routes: Routes = [
  {
    path: 'list',
    component: WorkOrderListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkOrderRoutingModule {}
