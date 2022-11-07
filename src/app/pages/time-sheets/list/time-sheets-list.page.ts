import { Component, OnInit } from '@angular/core';
import { TimeSheetTypeInterface } from '@app/interfaces/time-sheet-type.interface';
import { TimeSheetInterface } from '@app/interfaces/time-sheet.interface';
import { AccountsDatabase } from '@app/services/database/accounts.database';
import { TimeSheetTypesDatabase } from '@app/services/database/time-sheet-types.database';
import { TimeSheetsDatabase } from '@app/services/database/time-sheets.database';
import { UtilsService } from '@app/services/utils.service';
import { environment } from '@env/environment';
import { AlertController } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-time-sheets-list',
  templateUrl: './time-sheets-list.page.html',
  styleUrls: ['./time-sheets-list.page.scss'],
})
export class TimeSheetsListPage implements OnInit {
  tab = 'daily';
  activeTimeSheet: TimeSheetInterface;
  timeSheets: TimeSheetInterface[] = [];
  types: TimeSheetTypeInterface[] = [];
  differenceFromCurrent = 0;

  constructor(
    private accountsDatabase: AccountsDatabase,
    private AlertController: AlertController,
    private timeSheetsDatabase: TimeSheetsDatabase,
    private timeSheetsTypesDatabase: TimeSheetTypesDatabase,
    public utilsService: UtilsService,
  ) {
  }

  get currentDate() {
    const weekOrDay = this.tab === 'daily' ? 'day' : 'week';

    if (this.tab === 'daily') {
      return this.utilsService.getLocalDate(new Date().toDateString());
    } else if (this.tab === 'weekly') {
      const startDate = moment().startOf(weekOrDay).format(environment.dateFormat);
      const endDate = moment().endOf(weekOrDay).format(environment.dateFormat);
      const weekNumber = moment(startDate).week();

      return `week #${weekNumber} ${startDate} - ${endDate}`;
    }
  }

  get dateToDisplay() {
    const weekOrDay = this.tab === 'daily' ? 'day' : 'week';
    if (this.tab === 'daily') {
      return moment().add(this.differenceFromCurrent, `${weekOrDay}s`).format(environment.dateFormat);
    } else if (this.tab === 'weekly') {
      const startDate = moment().add(this.differenceFromCurrent, `${weekOrDay}s`)
        .startOf(weekOrDay).format(environment.dateFormat);
      const endDate = moment().add(this.differenceFromCurrent, `${weekOrDay}s`)
        .endOf(weekOrDay).format(environment.dateFormat);
      const weekNumber = moment(startDate).week();

      return `week #${weekNumber} ${startDate} - ${endDate}`;
    }
  }

  async ngOnInit() {
    moment.updateLocale('en', {
      week: {
        dow: environment.firstDayOfWeek,
      }
    });

    this.types = await this.timeSheetsTypesDatabase.getTimeSheetTypes();
  }

  async ionViewWillEnter() {
    this.activeTimeSheet = await this.timeSheetsDatabase.getLastRunningTimeSheet();

    await this.loadTimeSheets();
  }

  onTabClick(tabName: string) {
    this.differenceFromCurrent = 0;
    this.tab = tabName;
    this.loadTimeSheets();
  }

  onPrevClick() {
    this.differenceFromCurrent--;
    this.loadTimeSheets();
  }

  onCurrentClick() {
    this.differenceFromCurrent = 0;
    this.loadTimeSheets();
  }

  onNextClick() {
    this.differenceFromCurrent++;
    this.loadTimeSheets();
  }

  async loadTimeSheets() {
    const weekOrDay = this.tab === 'daily' ? 'day' : 'week';
    const startDate = moment().add(this.differenceFromCurrent, `${weekOrDay}s`)
      .startOf(weekOrDay).format('YYYY-MM-DD HH:mm:ss');
    const endDate = moment().add(this.differenceFromCurrent, `${weekOrDay}s`)
      .endOf(weekOrDay).format('YYYY-MM-DD HH:mm:ss');

    this.timeSheets = (await this.timeSheetsDatabase.getAllForDateRange(startDate.toString(), endDate.toString()))
      .map(timeSheet => ({
        ...timeSheet,
        time: this.utilsService.getDatesDifferenceInSeconds(timeSheet.start_at, timeSheet.stop_at)
      }));
  }

  onStartActivityClick() {
    this.showCreateTimeSheetAlert();
  }

  async onStopActivityClick() {
    if (this.getType(this.activeTimeSheet.type_id).is_description_required === 0) {
      this.activeTimeSheet.description = await this.showStopActivityAlert();
    }

    this.activeTimeSheet = await this.timeSheetsDatabase.stop(this.activeTimeSheet);
    this.activeTimeSheet.time = this.utilsService.getDatesDifferenceInSeconds(this.activeTimeSheet.start_at, this.activeTimeSheet.stop_at);
    const index = this.timeSheets.findIndex(ts => ts.uuid === this.activeTimeSheet.uuid);
    this.timeSheets[index] = this.activeTimeSheet;
    this.activeTimeSheet = null;
  }

  async showCreateTimeSheetAlert() {
    const notWoRelatedTypes = this.types.filter(type => type.is_work_order_related === 0);

    const alert = await this.AlertController.create({
      header: 'Select type',
      backdropDismiss: false,
      cssClass: 'form-alert',
      inputs: notWoRelatedTypes.map(type => ({
        type: 'radio',
        name: type.name,
        label: type.name,
        value: type.id,
      })),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Submit',
          role: 'submit',
          cssClass: 'alert-button-confirm',
          handler: (data: string) => {
            if (!data) {

              return false;
            }
          }
        }
      ]
    });

    alert.present();

    alert.onDidDismiss().then(res => {
      if (res.role === 'submit') {
        this.createTimeSheet(res.data.values);
      }
    });
  }

  async showStopActivityAlert() {
    const alert = await this.AlertController.create({
      header: 'Description',
      backdropDismiss: false,
      cssClass: 'form-alert',
      inputs: [
        {
          type: 'textarea',
          name: 'description',
          label: 'Description',
        }
      ],
      buttons: [
        {
          text: 'Skip',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Save',
          role: 'save',
          cssClass: 'alert-button-confirm',
          handler: (data) => {
            if (!data.description) {

              return false;
            }
          }
        }
      ]
    });
    alert.present();

    const res = await alert.onDidDismiss();

    return res.role === 'save' ? res.data.values.description : null;
  }

  async createTimeSheet(typeId: number) {
    const account = await this.accountsDatabase.getActive();

    const newTimeSheet: TimeSheetInterface = {
      type_id: typeId,
      object_type: 'person',
      object_uuid: account.uuid
    };

    this.activeTimeSheet = await this.timeSheetsDatabase.create(newTimeSheet);
    this.timeSheets.push(this.activeTimeSheet);
  }

  getType(typeId: number) {
    return this.types.find((type) => type.id === typeId);
  }

  getStartAt(timeSheet: TimeSheetInterface) {
    return this.utilsService.getLocalDatetime(timeSheet.time < 0 ? timeSheet.stop_at : timeSheet.start_at);
  }

  getStopAt(timeSheet: TimeSheetInterface) {
    return this.utilsService.getLocalDatetime(timeSheet.time < 0 ? timeSheet.start_at : timeSheet.stop_at);
  }

  secondsToTime(totalSeconds: number) {
    const hours = Math.floor(Math.abs(totalSeconds) / 3600);
    const minutes = Math.floor(Math.abs(totalSeconds) / 60) % 60;
    const seconds = Math.abs(totalSeconds) % 60;
    const sign = totalSeconds >= 0 ? '' : '-';

    return `${sign}${hours}h ${minutes}m ${seconds}s`;
  }

  getTotalTime() {
    let total = 0;

    for (const timeSheet of this.timeSheets) {
      total += timeSheet.time || 0;
    }

    return this.secondsToTime(total);
  }

  getTotalTimeOfWo() {
    let total = 0;

    for (const timeSheet of this.timeSheets) {
      if (timeSheet.object_type === 'work_order') {
        total += timeSheet.time || 0;
      }
    }

    return this.secondsToTime(total);
  }

  getTotalTimeOfType(typeId: number) {
    let total = 0;

    for (const timeSheet of this.timeSheets) {
      if (timeSheet.type_id === typeId) {
        total += timeSheet.time || 0;
      }
    }

    return total;
  }

  getTotalTimeByWoNumber() {
    const total = new Map<string, number>();

    for (const timeSheet of this.timeSheets) {
      if (timeSheet.object_type !== 'work_order') {
        continue;
      }
      if (total.has(timeSheet.work_order_number)) {
        total.set(timeSheet.work_order_number, total.get(timeSheet.work_order_number) + timeSheet.time || 0);
      } else {
        total.set(timeSheet.work_order_number, timeSheet.time || 0);
      }
    }

    return total;
  }
}

