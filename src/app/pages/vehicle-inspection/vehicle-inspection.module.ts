import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VehicleInspectionsRoutingModule } from './vehicle-inspection-routing.module';
import { SharedModule } from '@app/shared.module';
import { DailyInspectionPage } from '@app/pages/vehicle-inspection/daily-inspection/daily-inspection.page';
import { WeeklyInspectionPage } from '@app/pages/vehicle-inspection/weekly-inspection/weekly-inspection.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    VehicleInspectionsRoutingModule
  ],
  declarations: [DailyInspectionPage, WeeklyInspectionPage]
})
export class VehicleInspectionModule {
}
