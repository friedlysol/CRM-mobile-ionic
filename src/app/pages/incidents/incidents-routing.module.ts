import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IncidentsFormPage } from './form/incidents-form.page';
import { IncidentsListPage } from './list/incidents-list.page';
import { IncidentsViewPage } from './view/incidents-view.page';

const routes: Routes = [
  {
    path: 'list',
    component: IncidentsListPage,
  },
  {
    path: 'form',
    component: IncidentsFormPage,
  },
  {
    path: 'view/:incidentUuid',
    component: IncidentsViewPage,
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IncidentsPageRoutingModule {}
