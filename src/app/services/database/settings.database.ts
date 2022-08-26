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

  getAllSettings(): Promise<Record<string, any>> {
    return this.databaseService.findAsArray(`select name, value from settings`)
      .then(result => _.indexBy(result, 'name'));
  }

  async create(name: string, value: any) {
    const query = this.getSqlForCreate(name, value);

    return this.databaseService.query(query.toString(), query.toParams());
  }

  async update(name: string, value: any) {
    const query = this.getSqlForUpdate(name, value);

    return this.databaseService.query(query.toString(), query.toParams());
  }

  getSqlForCreate(name: string, value: any) {
    return sqlBuilder.insert('settings', {name, value});
  }

  getSqlForUpdate(name: string, value: any) {
    return sqlBuilder.update('settings', {value}).where({name});
  }
}
