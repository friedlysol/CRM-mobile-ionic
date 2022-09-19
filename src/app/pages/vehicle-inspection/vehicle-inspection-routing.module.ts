import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VehicleInspectionListPage } from './components/vehicle-inspection-list/vehicle-inspection-list.page';

const routes: Routes = [
  {
    path: 'list',
    component: VehicleInspectionListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehicleInspectionsRoutingModule {}
