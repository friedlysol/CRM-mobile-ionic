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

  deleteAll(): Promise<any> {
    return this.databaseService.query(`delete from time_sheet_types`);
  }

  async create(timeSheetType: TimeSheetTypeInterface) {
    const query = sqlBuilder.insert('time_sheet_types', timeSheetType);

    return this.databaseService.query(query.toString(), query.toParams());
  }

  async bulkCreate(timeSheetTypes: TimeSheetTypeInterface[]) {
    const query = [];

    if (!_.isEmpty(timeSheetTypes)) {
      for (const timeSheetType of timeSheetTypes) {
        query.push(sqlBuilder.insert('time_sheet_types', timeSheetTypes));
      }

      return this.databaseService.bulkQueries(query);
    }

    return Promise.resolve(null);
  }
}
