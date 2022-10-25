import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import * as moment from 'moment';
import { VehicleInspectionsDatabase } from './database/vehicle-inspection.database';

@Injectable({
    providedIn: 'root'
})
export class VehicleInspectionService{
    private isDailyInspectionRequired = null;
    private isWeeklyInspectionRequired = null;

    constructor(private vehicleInspectionsDatabase: VehicleInspectionsDatabase){}

    async checkIfDailyInspectionIsRequired(): Promise<boolean>{
        if(this.isDailyInspectionRequired === null){
            const lastInspectionDate = (await this.vehicleInspectionsDatabase.getLastDaily())?.created_at;
            if(!lastInspectionDate) {
                this.isDailyInspectionRequired = true;
            }else{
                this.isDailyInspectionRequired = !moment.utc(lastInspectionDate).local().isSame(new Date(), 'day');
            }
        }

        return this.isDailyInspectionRequired;
    }

    async checkIfWeeklyInspectionIsRequired(): Promise<boolean>{
        moment.updateLocale('en', {
            week: {
                dow: environment.firstDayOfWeek,
            }
        });

        if(this.isWeeklyInspectionRequired === null){
            const lastInspectionDate = (await this.vehicleInspectionsDatabase.getLastWeekly())?.created_at;
            if(!lastInspectionDate){
                this.isWeeklyInspectionRequired = true;
            }else{
                this.isWeeklyInspectionRequired = !moment.utc(lastInspectionDate).local().isSame(new Date(), 'week');
            }
        }

        return this.isWeeklyInspectionRequired;
    }
}
