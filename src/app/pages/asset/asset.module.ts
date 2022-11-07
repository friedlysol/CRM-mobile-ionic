import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssetPageRoutingModule } from './asset-routing.module';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@app/shared.module';

import { AssetFormPage } from './asset-form/asset-form.page';
import { AssetListPage } from './asset-list/asset-list.page';
import { AssetViewPage } from './asset-view/asset-view.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AssetPageRoutingModule,
    SharedModule
  ],
  declarations: [AssetFormPage, AssetListPage, AssetViewPage]
})
export class AssetPageModule {
}
