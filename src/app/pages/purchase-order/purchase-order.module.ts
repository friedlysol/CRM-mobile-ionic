import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PurchaseOrderRoutingModule } from './purchase-order-routing.module';
import { PurchaseOrderListPage } from './purchase-order-list/purchase-order-list.page';
import { PurchaseOrderFormPage } from '@app/pages/purchase-order/purchase-order-form/purchase-order-form.page';
import { PurchaseOrderViewPage } from '@app/pages/purchase-order/purchase-order-view/purchase-order-view.page';
import { SharedModule } from '@app/shared.module';
import {
  PurchaseOrderEntryComponent
} from '@app/pages/purchase-order/modals/purchase-order-entry/purchase-order-entry.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PurchaseOrderRoutingModule,
    SharedModule
  ],
  declarations: [PurchaseOrderEntryComponent, PurchaseOrderFormPage, PurchaseOrderListPage, PurchaseOrderViewPage]
})
export class PurchaseOrderModule {}
