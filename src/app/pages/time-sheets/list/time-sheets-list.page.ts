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
  currentDate: string;
  activeTimeSheet: TimeSheetInterface;
  timeSheets: TimeSheetInterface[] = [];
  types: TimeSheetTypeInterface[] = [];

  constructor(
    private accountsDatabase: AccountsDatabase,
    private alertCtrl: AlertController,
    private timeSheetsDatabase: TimeSheetsDatabase,
    private timeSheetsTypesDatabase: TimeSheetTypesDatabase,
    public utilsService: UtilsService,
  ) { }

  async ngOnInit() {
    this.currentDate = this.utilsService.getLocalDate(new Date().toDateString());
    this.activeTimeSheet = await this.timeSheetsDatabase.getLastRunningTimeSheet();
    const utcToday = moment().format('YYYY-MM-DD hh:mm:ss');
    this.timeSheets = await this.timeSheetsDatabase.getAllForDateRange(utcToday.toString(), utcToday.toString());
    console.log(this.timeSheets)
    this.types = await this.timeSheetsTypesDatabase.getAllByIsWorkOrderRelated(false);
    console.log(this.types)
    console.log(this.activeTimeSheet)
  }

  onStartActivityClick(){
    this.showCreateTimeSheetAlert();
  }

  async onStopActivityClick(){
    if(this.getType(this.activeTimeSheet.type_id).is_description_required === 0){
      this.activeTimeSheet.description = await this.showStopActivityAlert();
    }

    this.activeTimeSheet = await this.timeSheetsDatabase.stop(this.activeTimeSheet);
    const index = this.timeSheets.findIndex(ts => ts.uuid === this.activeTimeSheet.uuid);
    this.timeSheets[index] = this.activeTimeSheet;
    this.activeTimeSheet = null;
  }

  async showCreateTimeSheetAlert(){
    const alert = await this.alertCtrl.create({
      header: 'Select type',
      backdropDismiss: false,
      inputs: this.types.map(type => ({
        type: 'radio',
        name: type.name,
        label: type.name,
        value: type.id,
      })),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Submit',
          role: 'submit',
          handler: (data: string) => {
            if(!data) {

              return false;
            }
          }
        }
      ]
    });
    alert.present();

    alert.onDidDismiss().then(res => {
      if(res.role === 'submit'){
        this.createTimeSheet(res.data.values);
      }
    });
  }

  async showStopActivityAlert(){
    const alert = await this.alertCtrl.create({
      header: 'Description',
      backdropDismiss: false,
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
        },
        {
          text: 'Save',
          role: 'save',
          handler: (data) => {
            if(!data.description) {

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

  async createTimeSheet(typeId: number){
    const uuid = (await this.accountsDatabase.getActive()).uuid;

    const newTimeSheet: TimeSheetInterface = {
      type_id: typeId,
      object_type: 'person',
      object_uuid: uuid
    };

    this.activeTimeSheet = await this.timeSheetsDatabase.create(newTimeSheet);
    this.timeSheets.push(this.activeTimeSheet);
  }

  getType(typeId: number){
    return this.types.find((type) => type.id === typeId);
  }

  getDateDifferenceString(startDate: string, endDate: string){
    const difference = this.utilsService.getDatesDifferenceInSeconds(startDate, endDate);
    const hours = Math.floor(difference/3600);
    const minutes = Math.floor(difference/60)%60;
    const seconds = difference%60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }


}
