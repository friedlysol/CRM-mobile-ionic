import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssetListPage } from '@app/pages/asset/asset-list/asset-list.page';
import { AssetFormPage } from '@app/pages/asset/asset-form/asset-form.page';
import { AssetViewPage } from '@app/pages/asset/asset-view/asset-view.page';

const routes: Routes = [
  {
    path: 'form/:workOrderUuid/:addressUuid',
    component: AssetFormPage
  },
  {
    path: 'form/:workOrderUuid/:addressUuid/:assetUuid',
    component: AssetFormPage
  },
  {
    path: 'list/:workOrderUuid/:addressUuid',
    component: AssetListPage
  },
  {
    path: 'view/:assetUuid',
    component: AssetViewPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssetPageRoutingModule {}
