import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DailyInspectionPage } from '@app/pages/vehicle-inspection/daily-inspection/daily-inspection.page';
import { WeeklyInspectionPage } from '@app/pages/vehicle-inspection/weekly-inspection/weekly-inspection.page';

const routes: Routes = [
  {
    path: 'daily',
    component: DailyInspectionPage
  },
  {
    path: 'weekly',
    component: WeeklyInspectionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehicleInspectionsRoutingModule {
}
