import { Injectable } from '@angular/core';
import { DailyInspectionInterface } from '@app/interfaces/daily-inspection.interface';
import { DatabaseService } from '../database.service';
import * as sqlBuilder from 'sql-bricks';
import * as _ from 'underscore';

@Injectable({
    providedIn: 'root'
})
export class DailyInspectionsDatabase {

    constructor(private databaseService: DatabaseService) {}

    async getByUuid(uuid: string): Promise<DailyInspectionInterface> {
        return this.databaseService.findOrNull(
            `select *
            from daily_inspections
            where uuid = ?`, [
            uuid
        ]);
    };

    async getAll(): Promise<DailyInspectionInterface[]> {
        return this.databaseService.findAsArray(
            `select *
            from daily_inspections`
        );
    };

    async getLast(): Promise<DailyInspectionInterface>{
        return this.databaseService.findOrNull(
            `select *
            from daily_inspections
            order by created_at desc`
        );
    }

    /**
     * Create inspection in db
     *
     * @param inspection
     */
     async create(inspection: DailyInspectionInterface): Promise<DailyInspectionInterface> {
        const uuid = this.databaseService.getUuid();

        const query = sqlBuilder.insert('daily_inspections', Object.assign({
                uuid,
                vehicle_number: inspection.vehicle_number,
                odometer_reading: inspection.odometer_reading,
                route: inspection.route,
                note: inspection.note,
                created_at: this.databaseService.getTimeStamp(),
                sync: 0,
            })
        );

        return this.databaseService.query(query.toString(), query.toParams())
            .then(() => this.getByUuid(uuid));
    }
}
