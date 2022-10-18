import { Injectable } from '@angular/core';
import { LogInterface } from '@app/interfaces/log.interface';
import { DatabaseService } from '@app/services/database.service';

import * as sqlBuilder from 'sql-bricks';

@Injectable({
  providedIn: 'root'
})
export class LogsDatabase {
  constructor(private databaseService: DatabaseService) {
  }

  /**
   * Create log
   *
   * @param logData
   * @private
   */
  public async create(logData: LogInterface): Promise<any> {
    logData.created_at = this.databaseService.getTimeStamp();

    const query = sqlBuilder.insert('logs', logData);

    return this.databaseService.query(query.toString(), query.toParams());
  }
}
