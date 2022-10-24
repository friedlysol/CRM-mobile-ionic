import { Injectable } from '@angular/core';
import { DailyInspectionInterface } from '@app/interfaces/daily-inspection.interface';
import { DatabaseService } from '../database.service';
import * as sqlBuilder from 'sql-bricks';
import * as _ from 'underscore';
import { TypeService } from '../type.service';

@Injectable({
    providedIn: 'root'
})
export class VehicleInspectionsDatabase {

    constructor(private databaseService: DatabaseService, private typeService: TypeService) {}

    async getDailyByUuid(uuid: string): Promise<DailyInspectionInterface> {
        return this.databaseService.findOrNull(
            `select *
            from daily_inspections
            where uuid = ?`, [
            uuid
        ]);
    };

    async getAllDaily(): Promise<DailyInspectionInterface[]> {
        return this.databaseService.findAsArray(
            `select *
            from daily_inspections`
        );
    };

    async getLastDaily(): Promise<DailyInspectionInterface>{
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
     async createDaily(inspection: DailyInspectionInterface): Promise<DailyInspectionInterface> {
        const uuid = this.databaseService.getUuid();
        const questions = (await this.typeService.getByType('daily_inspection_questions'))
            .map(question => question.type_key.split('.')[1]);

        const query = sqlBuilder.insert('daily_inspections', Object.assign({
                uuid,
                vehicle_number: inspection.vehicle_number,
                odometer_reading: inspection.odometer_reading,
                route: inspection.route,
                note: inspection.note,
                created_at: this.databaseService.getTimeStamp(),
                sync: 0,
            }, _.pick(inspection, questions)
        ));

        return this.databaseService.query(query.toString(), query.toParams())
            .then(() => this.getDailyByUuid(uuid));
    }
}