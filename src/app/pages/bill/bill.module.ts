import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BillRoutingModule } from './bill-routing.module';
import { BillListPage } from './bill-list/bill-list.page';
import { SharedModule } from '@app/shared.module';
import { BillFormPage } from '@app/pages/bill/bill-form/bill-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    BillRoutingModule,
    SharedModule
  ],
  declarations: [BillFormPage, BillListPage]
})
export class BillModule {
}
