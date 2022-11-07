import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';
import { BillEntryFiltersInterface, BillEntryInterface } from '@app/interfaces/bill-entry.interface';
import { UtilsService } from '@app/services/utils.service';
import { BillEntryApiInterface } from '@app/providers/api/interfaces/response-bill-api.interface';
import { AccountsDatabase } from './accounts.database';
import { SyncApiInterface } from '@app/providers/api/interfaces/sync-api.interface';
import { TypeService } from '@app/services/type.service';

import * as sqlBuilder from 'sql-bricks';
import * as _ from 'underscore';

@Injectable({
  providedIn: 'root'
})
export class AssetDatabase {
  constructor(
    private accountsDatabase: AccountsDatabase,
    private databaseService: DatabaseService,
    private typeService: TypeService,
    private utilsService: UtilsService
  ) {
  }

  /**
   * Get bill entry by uuid
   *
   * @param uuid
   */
  getByUuid(uuid: string): Promise<BillEntryInterface> {
    return this.databaseService.findOrNull(`
      select *
      from assets 
      where uuid = ?
    `, [
      uuid
    ]);
  }
}
