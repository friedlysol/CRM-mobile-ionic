import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { VehicleInspectionsDatabase } from './database/vehicle-inspection.database';
import { SyncInterface } from '@app/interfaces/sync.interface';
import { DatabaseService } from '@app/services/database.service';
import { VehicleInspectionApi } from '@app/providers/api/vehicle-inspection-api';
import {
  ResponseVehicleInspectionApiInterface, VehicleDailyInspectionApiInterface
} from '@app/providers/api/interfaces/response-vehicle-inspection-api.interface';

import * as moment from 'moment';
import { EventService } from '@app/services/event.service';

@Injectable({
  providedIn: 'root'
})
export class VehicleInspectionService implements SyncInterface {
  syncTitle = 'vehicle inspections'

  private isDailyInspectionRequired = null;
  private isWeeklyInspectionRequired = null;

  constructor(
    private databaseService: DatabaseService,
    private vehicleInspectionsDatabase: VehicleInspectionsDatabase,
    private vehicleInspectionApi: VehicleInspectionApi
  ) {
  }

  async sync() {
    const syncData = {
      daily: await this.databaseService.getUnSynchronized('daily_inspections'),
      weekly: await this.databaseService.getUnSynchronized('weekly_inspections'),
    };

    return this.vehicleInspectionApi.sync(syncData)
      .toPromise()
      .then(async (res: ResponseVehicleInspectionApiInterface) => {
        await this.syncStatus(res);

        await this.syncDailyInspections(res);

        return true;
      });
  }

  setIsDailyInspectionRequired(value: boolean) {
    this.isDailyInspectionRequired = value;
  }

  setIsWeeklyInspectionRequired(value: boolean) {
    this.isWeeklyInspectionRequired = value;
  }

  async checkIfDailyInspectionIsRequired(): Promise<boolean> {
    if (this.isDailyInspectionRequired === null) {
      const lastInspectionDate = (await this.vehicleInspectionsDatabase.getLastDaily())?.created_at;

      if (!lastInspectionDate) {
        this.isDailyInspectionRequired = true;
      } else {
        this.isDailyInspectionRequired = !moment.utc(lastInspectionDate).local().isSame(new Date(), 'day');
      }
    }

    return this.isDailyInspectionRequired;
  }

  async checkIfWeeklyInspectionIsRequired(): Promise<boolean> {
    if (this.isWeeklyInspectionRequired === null) {
      moment.updateLocale('en', {
        week: {
          dow: environment.firstDayOfWeek,
        }
      });

      const lastInspectionDate = (await this.vehicleInspectionsDatabase.getLastWeekly())?.created_at;

      if (!lastInspectionDate) {
        this.isWeeklyInspectionRequired = true;
      } else {
        this.isWeeklyInspectionRequired = !moment.utc(lastInspectionDate).local().isSame(new Date(), 'week');
      }
    }

    return this.isWeeklyInspectionRequired;
  }

  private async syncStatus(res: ResponseVehicleInspectionApiInterface) {
    const queue = [];

    if (res?.response?.syncs?.daily_inspections?.length) {
      res.response.syncs.daily_inspections.forEach(sync => {
        if (sync.uuid && sync.object_id) {
          queue.push(this.databaseService.getSqlForUpdateSyncStatus('daily_inspections', sync));
          queue.push(this.databaseService.getSqlForUpdateFileSyncStatus('daily_inspections', sync));
        }
      });
    }

    if (res?.response?.syncs?.weekly_inspections?.length) {
      res.response.syncs.weekly_inspections.forEach(sync => {
        if (sync.uuid && sync.object_id) {
          queue.push(this.databaseService.getSqlForUpdateSyncStatus('weekly_inspections', sync));
          queue.push(this.databaseService.getSqlForUpdateFileSyncStatus('weekly_inspections', sync));
        }
      });
    }

    if (queue.length) {
      return this.databaseService.bulkQueries(queue);
    }

    return Promise.resolve({});
  }

  private async syncDailyInspections(res: ResponseVehicleInspectionApiInterface) {
    if (res?.response?.daily_inspections?.length) {
      EventService.syncDetails.next({
        start: moment().toISOString(),
        title: this.syncTitle,
        total: res.response.daily_inspections.length,
        done: 0
      });

      const queue = [];

      res.response.daily_inspections.forEach(dailyInspection => {
        queue.push(this.vehicleInspectionsDatabase.getSqlForUpdateAppLockFromApiData(dailyInspection));
      });

      return this.databaseService.bulkQueries(queue);
    }

    return Promise.resolve({});
  }
}
