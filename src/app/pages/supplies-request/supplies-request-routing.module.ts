import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SuppliesRequestListPage } from './supplies-request-list/supplies-request-list.page';

const routes: Routes = [
  {
    path: 'list',
    component: SuppliesRequestListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuppliesRequestRoutingModule {}
