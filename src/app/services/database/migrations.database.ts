import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';

import * as sqlBuilder from 'sql-bricks';

@Injectable({
  providedIn: 'root'
})
export class MigrationsDatabase {
  constructor(private databaseService: DatabaseService) {
  }

  isExists(name: number | string): Promise<boolean> {
    return this.databaseService.findOrNull(`select name from migrations where name = ?`, [name])
      .then(result => !!result);
  }

  getLastMigrationId(): Promise<number> {
    return this.databaseService.findOrNull(`select max(cast(name as integer)) as name from migrations`)
      .then(result => result?.name || 0);
  }

  create(name: number) {
    const query = sqlBuilder.insert('migrations', {
      name,
      migrated_at: this.databaseService.getTimeStamp()
    });

    return this.databaseService.query(query.toString(), query.toParams());
  }

  createError(name: number | string, sql: string, err: any) {
    const query = sqlBuilder.insert('migration_errors', {
      name,
      query: sql,
      error: err,
      created_at: this.databaseService.getTimeStamp()
    });

    return this.databaseService.query(query.toString(), query.toParams());
  }
}
