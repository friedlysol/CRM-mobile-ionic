import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PurchaseOrderFormPage } from '@app/pages/purchase-order/purchase-order-form/purchase-order-form.page';
import { PurchaseOrderListPage } from '@app/pages/purchase-order/purchase-order-list/purchase-order-list.page';
import { PurchaseOrderViewPage } from '@app/pages/purchase-order/purchase-order-view/purchase-order-view.page';

const routes: Routes = [
  {
    path: 'form',
    component: PurchaseOrderFormPage
  },
  {
    path: 'list',
    component: PurchaseOrderListPage
  },
  {
    path: 'view/:purchaseOrderUuid',
    component: PurchaseOrderViewPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchaseOrderRoutingModule {}
