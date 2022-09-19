import { Injectable } from '@angular/core';
import { EventService } from '@app/services/event.service';
import { SettingsService } from '@app/pages/settings/services/settings.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  constructor(private settingsService: SettingsService) { }

  async sync() {
    EventService.syncInProgress.next(true);

    await this.settingsService.sync();
  }
}
