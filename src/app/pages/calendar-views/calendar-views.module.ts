import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CalendarViewsPageRoutingModule } from './calendar-views-routing.module';

import { CalendarViewsListPage } from './list/calendar-views-list.page';
import { SharedModule } from '@app/shared.module';
import { CalendarViewsViewPage } from './view/calendar-views-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    CalendarViewsPageRoutingModule
  ],
  declarations: [CalendarViewsListPage, CalendarViewsViewPage]
})
export class CalendarViewsPageModule {}
