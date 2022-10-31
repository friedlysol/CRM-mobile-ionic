import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IncidentsFormPage } from './form/incidents-form.page';
import { IncidentsListPage } from './list/incidents-list.page';

const routes: Routes = [
  {
    path: 'list',
    component: IncidentsListPage,
  },
  {
    path: 'form',
    component: IncidentsFormPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IncidentsPageRoutingModule {}
