import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';
import { PermissionInterface } from '@app/interfaces/permission.interface';

import * as _ from 'underscore';
import * as sqlBuilder from 'sql-bricks';

@Injectable({
  providedIn: 'root'
})
export class PermissionsDatabase {
  constructor(private databaseService: DatabaseService) {
  }

  deleteAll(): Promise<any> {
    return this.databaseService.query(`delete from permissions`);
  }

  async create(name: string, access: number) {
    const query = sqlBuilder.insert('permissions', {name, access});

    return this.databaseService.query(query.toString(), query.toParams());
  }

  async bulkCreate(permissions: PermissionInterface[]) {
    const query = [];

    if (!_.isEmpty(permissions)) {
      for (const permission of permissions) {
        query.push(sqlBuilder.insert('permissions', permission));
      }

      return this.databaseService.bulkQueries(query);
    }

    return Promise.resolve(null);
  }
}
