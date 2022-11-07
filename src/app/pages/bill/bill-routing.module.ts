import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BillFormPage } from '@app/pages/bill/bill-form/bill-form.page';
import { BillListPage } from '@app/pages/bill/bill-list/bill-list.page';

const routes: Routes = [
  {
    path: 'form',
    component: BillFormPage
  },
  {
    path: 'form/:billEntryUuid',
    component: BillFormPage
  },
  {
    path: 'list',
    component: BillListPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BillRoutingModule {
}
