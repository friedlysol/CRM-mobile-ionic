import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SuppliesRequestFormPage } from './supplies-request-form/supplies-request-form.page';
import { SuppliesRequestListPage } from './supplies-request-list/supplies-request-list.page';

const routes: Routes = [
  {
    path: 'list',
    component: SuppliesRequestListPage
  },
  {
    path: 'form',
    component: SuppliesRequestFormPage
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuppliesRequestRoutingModule {}
