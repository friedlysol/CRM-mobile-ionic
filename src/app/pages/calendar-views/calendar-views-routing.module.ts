import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalendarViewsListPage } from './list/calendar-views-list.page';
import { CalendarViewsViewPage } from './view/calendar-views-view.page';

const routes: Routes = [
  {
    path: 'list',
    component: CalendarViewsListPage
  },
  {
    path: 'view/:date',
    component: CalendarViewsViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalendarViewsPageRoutingModule {}
