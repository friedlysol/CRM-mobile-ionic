import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MessageCenterListPage } from './message-center-list/message-center-list.page';

const routes: Routes = [
  {
    path: 'list',
    component: MessageCenterListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessageCenterRoutingModule {}
