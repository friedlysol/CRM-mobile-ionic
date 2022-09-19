import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VehicleInspectionsRoutingModule } from './vehicle-inspection-routing.module';
import { VehicleInspectionListPage } from './components/vehicle-inspection-list/vehicle-inspection-list.page';
import { SharedModule } from '@app/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    VehicleInspectionsRoutingModule
  ],
  declarations: [VehicleInspectionListPage]
})
export class VehicleInspectionModule {}
