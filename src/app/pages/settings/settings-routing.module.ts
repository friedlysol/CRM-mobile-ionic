import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SettingsListPage } from './settings-list/settings-list.page';
import { SyncStatusPage } from '@app/pages/settings/sync-status/sync-status.page';
import { UploadQueuePage } from '@app/pages/settings/upload-queue/upload-queue.page';
import { DatabaseQueryPage } from '@app/pages/settings/database-query/database-query.page';

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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {
}
