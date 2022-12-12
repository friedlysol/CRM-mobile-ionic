import { Injectable } from '@angular/core';
import { DailyInspectionInterface } from '@app/interfaces/daily-inspection.interface';
import { DatabaseService } from '../database.service';
import * as sqlBuilder from 'sql-bricks';
import * as _ from 'underscore';
import { TypeService } from '../type.service';
import { WeeklyInspectionInterface } from '@app/interfaces/weekly-inspection.interface';
import { SyncApiInterface } from '@app/providers/api/interfaces/sync-api.interface';
import {
  VehicleDailyInspectionApiInterface
} from '@app/providers/api/interfaces/response-vehicle-inspection-api.interface';

@Injectable({
  providedIn: 'root'
})
export class VehicleInspectionsDatabase {

  constructor(private databaseService: DatabaseService, private typeService: TypeService) {
  }

  getExistingDailyInspectionRecordsAsMap() {
    const query = sqlBuilder
      .select('id', 'hash')
      .from('types');

    return this.databaseService
      .findAsArray(query.toString(), query.toParams())
      .then(types => {
        const typesMap = {};

        if (types && types.length) {
          types.forEach(type => typesMap[Number(type.id)] = type.hash);
        }

        return typesMap;
      });
  }

  async getDailyByUuid(uuid: string): Promise<DailyInspectionInterface> {
    return this.databaseService.findOrNull(
      `select *
            from daily_inspections
            where uuid = ?`, [
        uuid
      ]);
  };

  async getWeeklyByUuid(uuid: string): Promise<WeeklyInspectionInterface> {
    return this.databaseService.findOrNull(
      `select *
            from weekly_inspections
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

  async getLastDaily(): Promise<DailyInspectionInterface> {
    return this.databaseService.findOrNull(
      `select *
            from daily_inspections
            order by created_at desc`
    );
  }

  async getLastWeekly(): Promise<WeeklyInspectionInterface> {
    return this.databaseService.findOrNull(
      `select *
            from weekly_inspections
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
    const questions = (await this.typeService.getByTypeWithMappedKeys('daily_inspection_questions'))
      .map(type => type.type_key);

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

  /**
   * Create inspection in db
   *
   * @param inspection
   */
  async createWeekly(inspection: WeeklyInspectionInterface): Promise<WeeklyInspectionInterface> {
    const uuid = inspection.uuid || this.databaseService.getUuid();

    const query = sqlBuilder.insert('weekly_inspections', Object.assign({
      uuid,
      created_at: this.databaseService.getTimeStamp(),
      sync: 0,
      route: inspection.route,
      vehicle_number: inspection.vehicle_number,
      odometer_reading: inspection.odometer_reading,
      oil: inspection.oil || 0,
      brake: inspection.brake || 0,
      washer: inspection.washer || 0,
      jack: inspection.jack || 0,
      tread: inspection.tread || 0,
      spare_tire: inspection.spare_tire || 0,
      tires_pressure_front_driver: inspection.tires_pressure_front_driver || 0,
      tires_pressure_front_passenger: inspection.tires_pressure_front_passenger || 0,
      tires_pressure_rear_driver: inspection.tires_pressure_rear_driver || 0,
      card_in_vehicle: inspection.card_in_vehicle || 0,
      registration_in_vehicle: inspection.registration_in_vehicle || 0
    }));

    return this.databaseService.query(query.toString(), query.toParams())
      .then(() => this.getWeeklyByUuid(uuid));
  }

  getLastVinAndOdometer(): Promise<any> {
    return this.databaseService.findOrNull(`
      select vehicle_number, odometer_reading 
      from daily_inspections 
      order by created_at desc
    `);
  }

  getVinList() {
    return this.databaseService.findAsArray(`
      select vehicle_number
      from vehicles 
      order by vehicle_number asc
    `);
  }

  getSqlForUpdateAppLockFromApiData(dailyInspection: VehicleDailyInspectionApiInterface) {
    return sqlBuilder
      .update('daily_inspections', Object.assign({
          app_lock: dailyInspection.app_lock,
          updated_at: this.databaseService.getTimeStamp()
        })
      )
      .where({id: dailyInspection.id});
  }
}
