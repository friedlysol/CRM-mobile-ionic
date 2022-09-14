import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsListPage } from './settings-list/settings-list.page';
import { SharedModule } from '@app/shared.module';
import { DatabaseQueryPage } from '@app/pages/settings/database-query/database-query.page';
import { SendAppStatePage } from '@app/pages/settings/send-app-state/send-app-state.page';
import { SyncStatusPage } from '@app/pages/settings/sync-status/sync-status.page';
import { UploadQueuePage } from '@app/pages/settings/upload-queue/upload-queue.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingsRoutingModule,
    SharedModule,
  ],
  declarations: [DatabaseQueryPage, UploadQueuePage, SendAppStatePage, SettingsListPage, SyncStatusPage]
})
export class SettingsModule {}
