import { Injectable } from '@angular/core';
import { EventService } from '@app/services/event.service';
import { SettingsService } from '@app/services/settings.service';
import { WorkOrderService } from '@app/services/workorder.service';
import { TypeService } from '@app/services/type.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  constructor(
    private settingsService: SettingsService,
    private typeService: TypeService,
    private workOrderService: WorkOrderService
  ) { }

  async sync() {
    EventService.syncInProgress.next(true);

    await this.settingsService.sync();
    await this.typeService.sync();
    await this.workOrderService.sync();

    EventService.endSync.next(true);
  }
}
