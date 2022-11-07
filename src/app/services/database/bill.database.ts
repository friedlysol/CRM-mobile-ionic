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
export class BillDatabase {
  constructor(
    private accountsDatabase: AccountsDatabase,
    private databaseService: DatabaseService,
    private typeService: TypeService,
    private utilsService: UtilsService
  ) {
  }

  /**
   * Get bill ids with waiting for approval status
   */
  async getWaitingForApproval() {
    return this.databaseService.findAsArray(`
      select id 
      from bill_entries 
      where object_type = 'person' and 
        bill_id is not null and 
        bill_status_type_id in (
          select id 
          from types 
          where type_key = 'bill_status_type.waiting_for_approval'
        )
    `);
  }

  /**
   * Get bill entry by uuid
   *
   * @param uuid
   */
  getByUuid(uuid: string): Promise<BillEntryInterface> {
    return this.databaseService.findOrNull(`
      select *
      from bill_entries 
      where uuid = ?
    `, [
      uuid
    ]);
  }

  /**
   * Get bill entry by
   *
   * @param billEntryId
   */
  getById(billEntryId): Promise<BillEntryInterface> {
    return this.databaseService.findOrNull(`
      select * from bill_entries where id = ?
    `, [
      billEntryId
    ]);
  };

  /**
   * Check bill entry photos
   *
   * @param billEntryUuid
   */
  hasUnitPhotos(billEntryUuid): Promise<boolean> {
    return this.databaseService.findAsArray(`
      select count(type_id) as count
      from files
      where object_uuid = ? and 
        object_type = 'bill' and
        type_id in (
          select types.id FROM types
          where types.type_key = 'bill_entry.receipt'
        )
        group by type_id
    `, [
      billEntryUuid
    ]).then(function (result: any[]) {
      return result && result.length >= 1;
    })
  };

  /**
   * Get expenses
   *
   * @param filters
   * @param page
   * @param limit
   */
  async getBills(filters?: BillEntryFiltersInterface, page = 1, limit = 15): Promise<BillEntryInterface[]> {
    let query = `
      select
        bill_entries.*,
        files.path as file_path,
        files.thumbnail as file_thumbnail,
        types.type_key,
        types.type_value,
        incorrect.type_value as incorrect_bill,
        case when files.uuid is null then 0 else 1 end as is_file
      from bill_entries
      left join files on files.uuid = (
        select uuid 
        from files 
        where files.object_uuid = bill_entries.uuid and files.object_type = "bill"
        order by files.created_at desc
        limit 1
      )
      left join types on types.id = bill_entries.bill_status_type_id
      left join types as incorrect on incorrect.id = bill_entries.incorrect_type_id
      where bill_entries.object_type = 'person'
    `;

    const conditions = await this.getFilters(filters);
    if (conditions.query) {
      query += ' and ' + conditions.query;
    }

    query += `
      group by bill_entries.uuid
      order by bill_entries.created_at desc
    `;

    if (limit) {
      query += ` limit ${limit} offset ${(page - 1) * limit}`
    }

    return this.databaseService.findAsArray(query, conditions.params)
      .then((expenses: BillEntryInterface[]) => expenses.map(expense => {
        if (expense.type_key) {
          expense.type_key = expense.type_key.split('.').pop();
        }

        return expense;
      }));
  };


  /**
   * Get count expenses
   *
   */
  async getCountBills(filters?: BillEntryFiltersInterface, page = 1, limit = 15): Promise<any> {
    let query = `
      select count(bill_entries.uuid) as total
      from bill_entries
      left join files on files.object_uuid = bill_entries.uuid and files.object_type = "bill"
      left join types on types.id = bill_entries.bill_status_type_id
      where bill_entries.object_type = 'person'
    `;

    const conditions = await this.getFilters(filters);
    if (conditions.query) {
      query += ' and ' + conditions.query;
    }

    return this.databaseService.findOrNull(query, conditions.params)
      .then((result: any) => {
        const total = result?.total || 0;

        return this.utilsService.getPagination(total, page, limit);
      });
  }

  /**
   * Get filters
   *
   * @param filters
   */
  async getFilters(filters?: BillEntryFiltersInterface): Promise<{ query: string, params: Array<any> }> {
    const params: Array<any> = [];

    let query = [];


    if (filters.query) {
      query.push(`
        (
          bill_entries.desc like ? or 
          bill_entries.total like ? or 
          bill_entries.supplier_name like ? or
          bill_entries.comment like ?
        )
      `);

      params.push('%' + filters.query + '%');
      params.push('%' + filters.query.replace(/\$/, '') + '%');
      params.push('%' + filters.query + '%');
      params.push('%' + filters.query + '%');
    }

    if (filters.reimbursement) {
      query.push(`bill_entries.reimbursement = 1`);
    }

    if (filters.is_photo) {
      query.push(`files.uuid is not null`);
    }

    if (filters.is_approved) {
      query.push(`
        (
          types.type_key <> ? or
          types.type_key is null
        ) 
      `);

      params.push('bill_status_type.approved');
    }

    if (filters.date_from) {
      query.push(`date(bill_entries.created_at) >= ?`);

      params.push(filters.date_from);
    }

    if (filters.date_to) {
      query.push(`date(bill_entries.created_at) <= ?`);

      params.push(filters.date_to);
    }

    return {
      query: query.join(' and '),
      params
    }
  }

  /**
   * Create bill entry
   *
   * @param billEntry
   */
  async create(billEntry: BillEntryInterface): Promise<BillEntryInterface> {
    const account = await this.accountsDatabase.getActive();

    if (!billEntry.uuid) {
      billEntry.uuid = this.databaseService.getUuid();
    }

    const query = sqlBuilder.insert('bill_entries', Object.assign({
        uuid: billEntry.uuid,
        type_id: billEntry.type_id || null,
        object_type: billEntry.object_type || 'person',
        object_uuid: billEntry.object_uuid || account.uuid,
        supplier_name: billEntry.supplier_name,
        desc: billEntry.desc || null,
        qty: billEntry.qty || null,
        price: billEntry.price || null,
        tax_amount: billEntry.tax_amount || null,
        total: billEntry.total || null,
        transaction_number: billEntry.transaction_number || null,
        reimbursement: billEntry.reimbursement || 0,
        bill_status_type_id: billEntry.bill_status_type_id || null,
        previous_bill_status_type_id: billEntry.previous_bill_status_type_id || null,
        sync: 0,
        created_at: this.databaseService.getTimeStamp()
      })
    );

    return this.databaseService.query(query.toString(), query.toParams())
      .then(() => this.getByUuid(billEntry.uuid));
  }

  /**
   * Update bill entry
   *
   * @param billEntry
   */
  update(billEntry: BillEntryInterface) {
    const allowFields = [
      'approval_person_id',
      'bill_status_type_id',
      'type_id',
      'desc',
      'previous_bill_status_type_id',
      'price',
      'qty',
      'reimbursement',
      'supplier_name',
      'tax_amount',
      'total',
      'transaction_number',
    ];

    const query = sqlBuilder
      .update('bill_entries', Object.assign({
          sync: 0,
          updated_at: this.databaseService.getTimeStamp()
        }, _.pick(billEntry, allowFields))
      )
      .where('uuid', billEntry.uuid);

    return this.databaseService.query(query.toString(), query.toParams());
  }

  /**
   * Remove bill entry from db
   *
   * @param billEntryUuid
   */
  remove(billEntryUuid) {
    return this.databaseService.query(`
      delete from bill_entries where uuid = ?
    `, [
      billEntryUuid
    ]);
  }

  /**
   * Update sync status
   *
   * @param sync
   */
  getSqlForUpdateSyncStatus(sync: SyncApiInterface) {
    return sqlBuilder
      .update('bill_entries', {id: sync.object_id, sync: 1})
      .where({uuid: sync.uuid});
  }

  /**
   * Create sql query as string
   *
   * @param billEntry
   */
  getSqlForCreateFromApiData(billEntry: BillEntryApiInterface) {
    return sqlBuilder.insert('bill_entries', Object.assign({
      uuid: this.databaseService.getUuid(),
      created_at: this.databaseService.getTimeStamp(),
      updated_at: null,
      sync: 0
    }, this.billEntryDatabaseObj(billEntry)));
  }

  /**
   * Update sql query as string
   *
   * @param billEntry
   * @param condition
   */
  getSqlForUpdateFromApiData(billEntry: BillEntryApiInterface, condition = {}) {
    return sqlBuilder
      .update('bill_entries', this.billEntryDatabaseObj(billEntry))
      .where(condition);
  }

  /**
   * Get database object based on api response
   *
   * @private
   * @param billEntry
   */
  private billEntryDatabaseObj(billEntry: BillEntryApiInterface): BillEntryInterface {
    return {
      id: billEntry.id,
      bill_id: billEntry.bill_id,
      desc: billEntry.description,
      qty: billEntry.qty,
      price: billEntry.price || null,
      tax_amount: billEntry.tax_amount || null,
      total: billEntry.total || null,
      supplier_name: billEntry.supplier_name || null,
      transaction_number: billEntry.transaction_number,
      reimbursement: billEntry.reimbursement || 0,
      approval_person_id: billEntry.approval_person_id || null,
      type_id: billEntry.type_id || null,
      bill_status_type_id: billEntry.bill_status_type_id || null,
      previous_bill_status_type_id: billEntry.previous_bill_status_type_id || null,
      incorrect_type_id: billEntry.incorrect_type_id || null,
      comment: billEntry.comment || null,
      hash: billEntry.hash || null,
      object_type: billEntry.table_name || null,
      object_uuid: billEntry.object_uuid || null,
    };
  }

  /**
   * Update bill id
   *
   * @param id
   * @param billId
   */
  getSqlForUpdateBillId(id: number, billId: number) {
    return sqlBuilder
      .update('bill_entries', {bill_id: billId})
      .where('id', id);
  }

  /**
   * Update file relations
   *
   * @param uuid
   * @param billId
   */
  getSqlForUpdateFileObjectId(uuid: string, billId: number) {
    return sqlBuilder
      .update('files', {object_id: billId})
      .where('object_type', 'bill')
      .where('object_uuid', uuid);
  }
}
