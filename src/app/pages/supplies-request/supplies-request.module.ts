import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SuppliesRequestRoutingModule } from './supplies-request-routing.module';
import { SuppliesRequestListPage } from './supplies-request-list/supplies-request-list.page';
import { SharedModule } from '@app/shared.module';
import { SuppliesRequestFormComponent } from './supplies-request-form/supplies-request-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    SuppliesRequestRoutingModule
  ],
  declarations: [SuppliesRequestListPage, SuppliesRequestFormComponent]
})
export class SuppliesRequestModule {}
