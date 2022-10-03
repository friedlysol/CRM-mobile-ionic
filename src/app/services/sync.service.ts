import { Injectable } from '@angular/core';
import { EventService } from '@app/services/event.service';
import { SettingsService } from '@app/services/settings.service';
import { WorkOrderService } from '@app/services/workorder.service';
import { TypeService } from '@app/services/type.service';
import { StaticService } from '@app/services/static.service';
import { DatabaseService } from './database.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { FileService } from './file.service';
import { FileInterface } from '@app/interfaces/file.interface';
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
  ) { }

  async sync() {
    EventService.syncInProgress.next(true);

    await this.settingsService.sync();
    await this.typeService.sync();
    await this.workOrderService.sync();

    EventService.endSync.next(true);
  }

  async exportDatabase(){
    if(!this.staticService.networkStatus.connected){
      return;
    }

    const copyPath = await Filesystem.copy({
      from: '../databases/database.db',
      to: `../databases/database${new Date().getTime()}.db`,
      directory: Directory.Data,
      toDirectory: Directory.Data,
    });

    const res = await this.fileService.uploadDatabase(copyPath.uri);
    console.log(res);
    // await this.http.post(`${environment.apiEndpoint}mobile/debug/db`, formData,
    // {
    //   headers: {
    //     'Content-Type': 'multipart/form-data'
    //   }
    // }).toPromise().then(e => console.log(e)).catch(e => console.log(e));

  }
}
