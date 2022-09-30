import { Injectable } from '@angular/core';
import { EventService } from '@app/services/event.service';
import { SettingsService } from '@app/services/settings.service';
import { WorkOrderService } from '@app/services/workorder.service';
import { TypeService } from '@app/services/type.service';
import { StaticService } from '@app/services/static.service';
import { DatabaseService } from './database.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  constructor(
    private databaseService: DatabaseService,
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
    EventService.databaseIsClosed.next(true);

    await this.databaseService.closeDatabase();
    const dbFileContent = await this.databaseService.getDatabaseFile();
    const encoder = new TextEncoder();
    const file = new File([encoder.encode(dbFileContent)], 'file');
    await this.http.post(`${environment.apiEndpoint}mobile/debug/db`, {
      file,
    }).toPromise().then(e => console.log(e)).catch(e => console.log(e));
    await this.databaseService.openDatabase();

    EventService.databaseIsOpen.next(true);
  }
}
