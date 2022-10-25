import { Injectable } from '@angular/core';
import { TypeApi } from '@app/providers/api/type-api';
import { ResponseTypeApiInterface } from '@app/providers/api/interfaces/response-type-api.interface';
import { TypeDatabase } from '@app/services/database/type.database';
import { TypeInterface } from '@app/interfaces/type.interface';
import { SyncInterface } from '@app/interfaces/sync.interface';
import { DatabaseService } from '@app/services/database.service';
import { ResponseSettingsApiInterface } from '@app/providers/api/interfaces/response-settings-api.interface';
import * as _ from 'underscore';
import { TechStatusDatabase } from '@app/services/database/tech-status.database';
import { LoggerService } from '@app/services/logger.service';
import { ResponseTechStatusApiInterface } from '@app/providers/api/interfaces/response-tech-status-api.interface';
import { TechStatusApi } from '@app/providers/api/tech-status-api';

@Injectable({
  providedIn: 'root'
})
export class TechStatusService implements SyncInterface {
  syncTitle = 'tech-statuses';

  constructor(
    private databaseService: DatabaseService,
    private loggerService: LoggerService,
    private techStatusDatabase: TechStatusDatabase,
    private techStatusApi: TechStatusApi
  ) {

  }

  async sync(): Promise<boolean> {
    return this.techStatusApi.sync({})
      .toPromise()
      .then(async (res: ResponseTechStatusApiInterface) => {
        await this.syncTechStatuses(res);

        return true;
      });
  }

  /**
   * Sync tech statuses
   *
   * @param res
   * @private
   */
  private async syncTechStatuses(res: ResponseTechStatusApiInterface) {
    const statuses = res?.response?.statuses || [];

    await this.techStatusDatabase.deleteAll();

    if (!_.isEmpty(statuses)) {
      try {
        await this.techStatusDatabase.bulkCreate(statuses);
      } catch (err) {
        this.loggerService.error('Cannot save tech statuses', err, statuses);
      }
    }
  }
}
