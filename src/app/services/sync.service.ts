import { Injectable } from '@angular/core';
import { EventService } from '@app/services/event.service';
import { SettingsService } from '@app/services/settings.service';
import { WorkOrderService } from '@app/services/workorder.service';
import { TypeService } from '@app/services/type.service';
import { StaticService } from '@app/services/static.service';
import { DatabaseService } from './database.service';
import { HttpClient } from '@angular/common/http';
import { FileService } from './file.service';
import { Directory, Filesystem } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  constructor(
    private databaseService: DatabaseService,
    private fileService: FileService,
    private http: HttpClient,
    private settingsService: SettingsService,
    private staticService: StaticService,
    private typeService: TypeService,
    private workOrderService: WorkOrderService,
  ) {
  }

  async sync() {
    EventService.syncInProgress.next(true);

    await this.settingsService.sync();
    await this.typeService.sync();
    await this.workOrderService.sync();

    EventService.endSync.next(true);
  }

  async exportDatabase() {
    if (!this.staticService.networkStatus.connected) {
      return false;
    }

    const copyPath = await Filesystem.copy({
      from: '../databases/database.db',
      to: `database_${new Date().getTime()}.txt`, //files with db extension are not sent, so it was replaced with txt
      directory: Directory.Data,
      toDirectory: Directory.Documents,
    });

    return await this.fileService.uploadDatabase(copyPath.uri);
  }
}
