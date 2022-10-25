import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';
import { GeolocationService } from '@app/services/geolocation.service';
import { TimeSheetInterface } from '@app/interfaces/time-sheet.interface';
import { WorkOrderInterface } from '@app/interfaces/work-order.interface';
import { isNull } from 'sql-bricks';

import * as sqlBuilder from 'sql-bricks';
import * as _ from 'underscore';


@Injectable({
  providedIn: 'root'
})
export class TimeSheetsDatabase {
  constructor(private databaseService: DatabaseService, private geolocationService: GeolocationService) {
  }

  getByUuid(timeSheetUuid: string): Promise<TimeSheetInterface> {
    return this.databaseService.findOrNull(`
      select * 
      from time_sheets 
      where uuid = ?
    `, [
      timeSheetUuid
    ]);
  };

  async create(timeSheet: TimeSheetInterface): Promise<TimeSheetInterface> {
    if (_.isEmpty(timeSheet.uuid)) {
      timeSheet.uuid = this.databaseService.getUuid();
    }

    const query = sqlBuilder.insert('time_sheets', {
      uuid: timeSheet.uuid,
      type_id: timeSheet.type_id || null,
      vehicle_id: timeSheet.vehicle_id || null,
      start_at: timeSheet.start_at || this.databaseService.getTimeStamp(),
      start_gps: timeSheet.start_gps || await this.geolocationService.getCurrentLocationAsString(),
      description: timeSheet.description || null,
      object_type: timeSheet.object_type,
      object_uuid: timeSheet.object_uuid,
      work_order_number: timeSheet.work_order_number || null,
      sync: 0,
      created_at: this.databaseService.getTimeStamp()
    });

    return this.databaseService.query(query.toString(), query.toParams())
      .then(() => this.getByUuid(timeSheet.uuid));
  }

  checkForMultipleTimers(): Promise<boolean> {
    return this.databaseService
      .findOrNull(`
          select count(*) as total 
          from time_sheets
          where stop_at IS NULL
        `)
      .then(timeSheets => {
        return timeSheets && timeSheets.total > 1
      });
  };

  async updateStartGps(timeSheetUuid: string, startGps: string = null): Promise<any> {
    const query = sqlBuilder
      .update('time_sheets', {
        start_gps: startGps || await this.geolocationService.getCurrentLocationAsString(),
        sync: 0,
        updated_at: this.databaseService.getTimeStamp()
      })
      .where('uuid', timeSheetUuid);

    return this.databaseService.query(query.toString(), query.toParams());
  };

  async updateStopGps(timeSheetUuid, stopGps: string = null): Promise<any> {
    const query = sqlBuilder
      .update('time_sheets', {
        stop_gps: stopGps || await this.geolocationService.getCurrentLocationAsString(),
        sync: 0,
        updated_at: this.databaseService.getTimeStamp()
      })
      .where('uuid', timeSheetUuid);

    return this.databaseService.query(query.toString(), query.toParams());
  };

  getLastTimeSheetWithVehicleId() {
    return this.databaseService.findOrNull(`
      select vehicles.* 
      from time_sheets 
      join vehicles on vehicles.id = time_sheets.vehicle_id 
      where time_sheets.vehicle_id is not null 
      order by datetime(time_sheets.start_at) desc 
      limit 1
    `);
  };

  setVehicle(timeSheetUuid: string, vehicleId: number): Promise<any> {
    const query = sqlBuilder
      .update('time_sheets', {
        vehicle_id: vehicleId,
        sync: 0,
        updated_at: this.databaseService.getTimeStamp()
      })
      .where('uuid', timeSheetUuid);

    return this.databaseService.query(query.toString(), query.toParams());
  };

  getLastTimeSheetForWorkOrderUuid(workOrderUuid: string): Promise<TimeSheetInterface> {
    return this.databaseService.findOrNull(`
      select * 
      from time_sheets 
      where object_type = 'work_order' and object_uuid = ?
      order by start_at desc 
      limit 1
    `, [
      workOrderUuid
    ]);
  };

  getLastTimeSheet(): Promise<TimeSheetInterface> {
    return this.databaseService.findOrNull(`
      select 
        time_sheets.*, 
        ifnull(work_orders.work_order_number, time_sheets.work_order_number) as work_order_number 
      from time_sheets 
      left join work_orders on work_orders.uuid = time_sheets.object_uuid 
      where time_sheets.object_uuid is not null 
      order by time_sheets.start_at desc 
      limit 1
    `);
  };

  getLastRunningTimeSheet(): Promise<TimeSheetInterface> {
    return this.databaseService.findOrNull(
      ' select * from time_sheets' +
      ' where stop_at is null ' +
      ' and object_uuid is not null ' +
      ' and start_at = (select max(start_at) from time_sheets) limit 1'
    );
  };

  getAllRunningTimeSheets(): Promise<TimeSheetInterface[]> {
    return this.databaseService.findAsArray(`
      select 
        time_sheets.*, 
        time_sheet_types.name as type 
      from time_sheets
      left join time_sheet_types on time_sheet_types.reason_type_id = time_sheets.type_id
      where stop_at is null 
      order by created_at asc
    `);
  };

  getLastRunningTimeSheetForWorkOrderUuid(workOrderUuid: string): Promise<TimeSheetInterface> {
    return this.databaseService.findOrNull(`
      select * 
      from time_sheets 
      where object_uuid = ? and stop_at is null 
      order by start_at desc 
      limit 1
    `, [
      workOrderUuid
    ]);
  };

  getAllRunningTimeSheetsWithWoConnected(): Promise<TimeSheetInterface> {
    return this.databaseService.findOrNull(`
      select
        time_sheets.*,
        time_sheet_types.name as type,
        ifnull(work_orders.work_order_number, time_sheets.work_order_number) as work_order_number
      from time_sheets
      left join work_orders on work_orders.uuid = time_sheets.object_uuid
      left join time_sheet_types on time_sheet_types.reason_type_id = time_sheets.type_id
      where stop_at is null  
    `);
  };

  getAllForDateRange(startDate: string, endDate: string): Promise<TimeSheetInterface[]> {
    return this.databaseService.findAsArray(`
      select
        time_sheets.*, 
        time_sheet_types.name as type,
        ifnull(work_orders.work_order_number, time_sheets.work_order_number) as work_order_number
      from time_sheets
      left join work_orders on work_orders.uuid = time_sheets.object_uuid
      left join time_sheet_types on time_sheet_types.reason_type_id = time_sheets.type_id
      where date(datetime(start_at, 'localtime')) >= date(?) and date(datetime(start_at, 'localtime')) <= date(?)
      order by datetime(start_at) asc      
    `, [
      startDate,
      endDate
    ]);
  };

  getLastClosedTimeSheet(): Promise<TimeSheetInterface> {
    return this.databaseService.findOrNull(`
      select * 
      from time_sheets
      where stop_at is not null
      order by stop_at desc
      limit 1   
    `);
  };

  async stop(timeSheet: TimeSheetInterface): Promise<any> {
    const query = sqlBuilder
      .update('time_sheets', {
        description: timeSheet.description,
        stop_at: this.databaseService.getTimeStamp(),
        stop_gps: await this.geolocationService.getCurrentLocationAsString(),
        sync: 0,
        updated_at: this.databaseService.getTimeStamp()
      })
      .where('uuid', timeSheet.uuid);

    return this.databaseService.query(query.toString(), query.toParams());
  };

  async stopForWorkOrder(workOrder: WorkOrderInterface): Promise<any> {
    const query = sqlBuilder
      .update('time_sheets', {
        stop_at: this.databaseService.getTimeStamp(),
        stop_gps: await this.geolocationService.getCurrentLocationAsString(),
        sync: 0,
        updated_at: this.databaseService.getTimeStamp()
      })
      .where('object_type', 'work_order')
      .where('object_uuid', workOrder.uuid)
      .where(isNull('stop_at'));

    return this.databaseService.query(query.toString(), query.toParams());
  };

  updateDescription(timeSheetUuid: string, description: string): Promise<any> {
    const query = sqlBuilder
      .update('time_sheets', {
        description: description,
        sync: 0,
        updated_at: this.databaseService.getTimeStamp()
      })
      .where('uuid', timeSheetUuid)
      .where(isNull('stop_at'));

    return this.databaseService.query(query.toString(), query.toParams());
  }

  getMaxEntryDate(): Promise<string | null> {
    return this.databaseService
      .findOrNull(`
        select max(start_at) as start_at 
        from time_sheets
      `)
      .then(timeSheet => {
        return timeSheet && !_.isEmpty(timeSheet.start_at)
          ? timeSheet.start_at
          : null;
      });
  };
}
