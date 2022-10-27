import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TimeSheetsListPage } from './list/time-sheets-list.page';

const routes: Routes = [
  {
    path: 'list',
    component: TimeSheetsListPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TimeSheetsPageRoutingModule {}
