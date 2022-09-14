import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';

import * as _ from 'underscore';
import * as sqlBuilder from 'sql-bricks';


@Injectable({
  providedIn: 'root'
})
export class SettingsDatabase {
  constructor(private databaseService: DatabaseService) {
  }

  /**
   * Get setting record by key
   *
   * @param key
   */
  getByKey(key) {
    return this.databaseService.findOrNull(`select * from settings where name = ?`, [key]);
  }

  /**
   * Get all settings mapped to key => value
   */
  getAllSettings(): Promise<Record<string, any>> {
    return this.databaseService.findAsArray(`select name, value from settings`)
      .then(result => _.indexBy(result, 'name'));
  }

  /**
   * Create setting in db
   *
   * @param name
   * @param value
   */
  async create(name: string, value: any) {
    const query = this.getSqlForCreate(name, value);

    return this.databaseService.query(query.toString(), query.toParams());
  }

  /**
   * Update settin in db
   *
   * @param name
   * @param value
   */
  async update(name: string, value: any) {
    const query = this.getSqlForUpdate(name, value);

    return this.databaseService.query(query.toString(), query.toParams());
  }

  /**
   * Remove setting from db
   *
   * @param key
   */
  remove(key) {
    return this.databaseService.query(`delete from settings where id = ?`, [key]);
  }

  /**
   * Create sql query as string
   *
   * @param name
   * @param value
   */
  getSqlForCreate(name: string, value: any) {
    return sqlBuilder.insert('settings', {name, value});
  }

  /**
   * Update sql query as string
   *
   * @param name
   * @param value
   */
  getSqlForUpdate(name: string, value: any) {
    return sqlBuilder.update('settings', {value}).where({name});
  }
}
