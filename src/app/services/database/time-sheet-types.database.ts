import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';
import { TimeSheetTypeInterface } from '@app/interfaces/time-sheet-type.interface';

import * as _ from 'underscore';
import * as sqlBuilder from 'sql-bricks';

@Injectable({
  providedIn: 'root'
})
export class TimeSheetTypesDatabase {
  constructor(private databaseService: DatabaseService) {
  }

  getTimeSheetTypes() {
    return this.databaseService.findAsArray(`
        select *
        from time_sheet_types
    `);
  }

  deleteAll(): Promise<any> {
    return this.databaseService.query(`
        delete from time_sheet_types
    `);
  }

  async create(timeSheetType: TimeSheetTypeInterface) {
    const query = sqlBuilder.insert('time_sheet_types', timeSheetType);

    return this.databaseService.query(query.toString(), query.toParams());
  }

  async bulkCreate(timeSheetTypes: TimeSheetTypeInterface[]) {
    const allowColumns = ['id', 'reason_type_id', 'is_description_required', 'is_work_order_related', 'name'];
    const query = [];

    if (!_.isEmpty(timeSheetTypes)) {
      for (const timeSheetType of timeSheetTypes) {
        query.push(sqlBuilder.insert('time_sheet_types', _.pick(timeSheetType, allowColumns)));
      }

      return this.databaseService.bulkQueries(query);
    }

    return Promise.resolve(null);
  }
}
