import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import * as moment from 'moment';
import { VehicleInspectionsDatabase } from './database/vehicle-inspection.database';

@Injectable({
  providedIn: 'root'
})
export class VehicleInspectionService {
  private isDailyInspectionRequired = null;
  private isWeeklyInspectionRequired = null;

  constructor(private vehicleInspectionsDatabase: VehicleInspectionsDatabase) {
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
}
