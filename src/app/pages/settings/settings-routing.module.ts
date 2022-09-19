import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsListPage } from './components/settings-list/settings-list.page';
import { SyncStatusPage } from '@app/pages/settings/components/sync-status/sync-status.page';
import { UploadQueuePage } from '@app/pages/settings/components/upload-queue/upload-queue.page';
import { DatabaseQueryPage } from '@app/pages/settings/components/database-query/database-query.page';
import { SendAppStatePage } from '@app/pages/settings/components/send-app-state/send-app-state.page';

const routes: Routes = [
  {
    path: 'list',
    component: SettingsListPage
  },
  {
    path: 'sync-status',
    component: SyncStatusPage
  },
  {
    path: 'upload-queue',
    component: UploadQueuePage
  },
  {
    path: 'database-query',
    component: DatabaseQueryPage
  },
  {
    path: 'send-app-state',
    component: SendAppStatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
