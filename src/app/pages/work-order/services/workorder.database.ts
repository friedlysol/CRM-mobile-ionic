import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';

import * as _ from 'underscore';
import * as sqlBuilder from 'sql-bricks';


@Injectable({
  providedIn: 'root'
})
export class WorkorderDatabase {
  constructor(private databaseService: DatabaseService) {
  }

  /**
   * Get work order record by uuid
   *
   * @param uuid
   */
  getByUuid(uuid) {
    return this.databaseService.findOrNull(`select * from work_orders where uuid = ?`, [uuid]);
  }

  /**
   * Create work order in db
   *
   * @param name
   * @param value
   */
  async create(name: string, value: any) {
    const query = this.getSqlForCreate(name, value);

    return this.databaseService.query(query.toString(), query.toParams());
  }

  /**
   * Update work order in db
   *
   * @param name
   * @param value
   */
  async update(name: string, value: any) {
    const query = this.getSqlForUpdate(name, value);

    return this.databaseService.query(query.toString(), query.toParams());
  }

  /**
   * Remove work_order from uuid
   *
   * @param uuid
   */
  remove(uuid) {
    return this.databaseService.query(`delete from work_orders where uuid = ?`, [uuid]);
  }

  /**
   * Create sql query as string
   *
   * @param name
   * @param value
   */
  getSqlForCreate(name: string, value: any) {
    return sqlBuilder.insert('work_orders', {name, value});
  }

  /**
   * Update sql query as string
   *
   * @param name
   * @param value
   */
  getSqlForUpdate(name: string, value: any) {
    return sqlBuilder.update('work_orders', {value}).where({name});
  }
}
