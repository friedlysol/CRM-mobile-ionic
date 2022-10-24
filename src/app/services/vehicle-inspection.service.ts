import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { VehicleInspectionsDatabase } from './database/vehicle-inspection.database';

@Injectable({
    providedIn: 'root'
})
export class VehicleInspectionService{
    constructor(private vehicleInspectionsDatabase: VehicleInspectionsDatabase){}

    async checkIfDailyInspectionIsRequired(): Promise<boolean>{
        const lastInspectionDate = (await this.vehicleInspectionsDatabase.getLastDaily()).created_at;

        return !moment.utc(lastInspectionDate).local().isSame(new Date(), 'day');
    }
}
