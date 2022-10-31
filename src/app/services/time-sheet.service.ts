import { Injectable } from '@angular/core';
import { SyncInterface } from '@app/interfaces/sync.interface';
import { TimeSheetsDatabase } from '@app/services/database/time-sheets.database';
import { TimeSheetInterface } from '@app/interfaces/time-sheet.interface';
import { DatabaseService } from '@app/services/database.service';
import { SettingsService } from '@app/services/settings.service';
import { TypeService } from '@app/services/type.service';
import { GeolocationService } from './geolocation.service';
import { TechStatusInterface } from '@app/interfaces/tech-status.interface';
import { AlertController } from '@ionic/angular';

import * as moment from 'moment/moment';
import * as _ from 'underscore';


@Injectable({
  providedIn: 'root'
})
export class TimeSheetService implements SyncInterface {
  syncTitle = 'time sheets';

  constructor(
    private alertController: AlertController,
    private databaseService: DatabaseService,
    private geolocationService: GeolocationService,
    private settingsService: SettingsService,
    private timeSheetsDatabase: TimeSheetsDatabase,
    private typeService: TypeService
  ) {
  }

  sync(): Promise<boolean> {
    return Promise.resolve(false);
  }

  calculateTotalForType(timeSheets: TimeSheetInterface[], type: string) {
    let totalInSeconds = 0;

    if (timeSheets) {
      timeSheets.map((timeSheet) => {
        if (!_.isEmpty(timeSheet.start_at) && !_.isEmpty(timeSheet.stop_at) && timeSheet.type === type) {
          if (Math.abs(this.unixifyTime(timeSheet.stop_at) - this.unixifyTime(timeSheet.start_at)) < 86400) {
            totalInSeconds += moment(timeSheet.stop_at).utc().diff(moment(timeSheet.start_at).utc(), 'seconds');
          }
        }
      });
    }

    return moment
      .utc(totalInSeconds * 1000)
      .format('hh:mm:ss');
  };

  calculateTotalByWorkOrder(timeSheets: TimeSheetInterface[]) {
    const totalByWorkOrderNumber = {};

    if (timeSheets) {
      timeSheets.forEach((timeSheet) => {
        if (!totalByWorkOrderNumber.hasOwnProperty(timeSheet.work_order_number)) {
          totalByWorkOrderNumber[timeSheet.work_order_number] = 0;
        }

        if (!_.isEmpty(timeSheet.start_at) && !_.isEmpty(timeSheet.stop_at)) {
          if (Math.abs(this.unixifyTime(timeSheet.stop_at) - this.unixifyTime(timeSheet.start_at)) < 86400) {
            const startTimeInSeconds = moment(timeSheet.start_at).utc();
            const totalInSeconds = moment(timeSheet.stop_at)
              .utc()
              .diff(startTimeInSeconds, 'seconds');

            totalByWorkOrderNumber[timeSheet.work_order_number] += totalInSeconds;
          }
        }
      })
    }

    for (const workOrderNumber in totalByWorkOrderNumber) {
      totalByWorkOrderNumber[workOrderNumber] = moment
        .utc(totalByWorkOrderNumber[workOrderNumber] * 1000)
        .format('hh:mm:ss');
    }

    return totalByWorkOrderNumber;
  };

  async checkForMultipleTimers() {
    const multipleTimers = await this.timeSheetsDatabase.checkForMultipleTimers();

    if (multipleTimers) {
      //ToDo: log in rollbar
    }

    return multipleTimers;
  }

  async start(timeSheet: TimeSheetInterface, checkRunningTimer = false) {
    await this.geolocationService.startWatch();

    if (_.isEmpty(timeSheet.uuid)) {
      timeSheet.uuid = this.databaseService.getUuid();
    }

    if (checkRunningTimer) {
      const runningTimeSheets = await this.timeSheetsDatabase.getAllRunningTimeSheets();
      if (runningTimeSheets.length) {
        for (let runningTimeSheet of runningTimeSheets) {
          await this.stop(runningTimeSheet as TimeSheetInterface);
        }
      }
    }

    let startTime = this.databaseService.getTimeStamp();

    const lastClosedTimeSheet = await this.timeSheetsDatabase.getLastClosedTimeSheet();
    if (lastClosedTimeSheet) {
      const secondsHavePassedSinceTheEnd = moment().diff(moment(lastClosedTimeSheet.stop_at), 'seconds');

      // For start time If previous time_sheet.stop_at was < 5 minutes ago make new start_at same as previous stop_at
      if (secondsHavePassedSinceTheEnd < this.settingsService.get('time_sheet.min_timer_duration', 300)) {
        startTime = lastClosedTimeSheet.stop_at;
      }
    }

    timeSheet.start_at = startTime;

    return this.timeSheetsDatabase.create(timeSheet);
  }

  async stop(timeSheet: TimeSheetInterface, data?: any) {
    if (!timeSheet.description && data?.description) {
      timeSheet.description = data.description;
    }

    timeSheet = await this.timeSheetsDatabase.stop(timeSheet);
    await this.geolocationService.stopWatch();

    return timeSheet;
  }

  async getDescription(techStatus: TechStatusInterface) {
    if (techStatus.description_required) {
      const alert = await this.alertController.create({
        header: 'Please enter description',
        cssClass: 'form-alert',
        buttons: [{
          text: 'Skip',
          role: 'skip',
          cssClass: 'alert-button-cancel',
        },
          {
            text: 'Save',
            role: 'save',
            cssClass: 'alert-button-confirm',
          }],
        inputs: [{
          type: 'textarea',
          name: 'description',
          placeholder: 'Description',
        }],
        backdropDismiss: false
      });

      await alert.present();

      return new Promise((resolve) => {
        alert.onDidDismiss().then(res => {
          if(res.role === 'skip') {
            resolve(null);
          } else {
            resolve(res?.data?.values?.description);
          }
        });
      });
    }

    return Promise.resolve(null);
  }

  async isStartTimeSheetByType(typeKey): Promise<boolean> {
    const lastRunningTimeSheet = await this.timeSheetsDatabase.getLastRunningTimeSheet();

    if (lastRunningTimeSheet) {
      const type = await this.typeService.getByKey(typeKey)

      return type.id === lastRunningTimeSheet.type_id;
    }

    return false;
  }

  private unixifyTime(_datetime) {
    return new Date(_datetime).getTime() / 1000;
  }
}
