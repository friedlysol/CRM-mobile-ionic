import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TimeSheetsPageRoutingModule } from './time-sheets-routing.module';
import { TimeSheetsListPage } from './list/time-sheets-list.page';
import { SharedModule } from '@app/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    TimeSheetsPageRoutingModule
  ],
  declarations: [TimeSheetsListPage]
})
export class TimeSheetsPageModule {}
