import { Injectable } from '@angular/core';
import { AddressDatabase } from '@app/services/database/address.database';
import { DatabaseService } from '@app/services/database.service';
import { EventService } from '@app/services/event.service';
import { BillDatabase } from '@app/services/database/bill.database';
import { BillApi } from '@app/providers/api/bill-api';
import { ResponseBillApiInterface } from '@app/providers/api/interfaces/response-bill-api.interface';
import { FileService } from '@app/services/file.service';
import { PaginationInterface } from '@app/interfaces/pagination.interface';
import { BillEntryFiltersInterface, BillEntryInterface } from '@app/interfaces/bill-entry.interface';
import { FileDatabase } from '@app/services/database/file.database';
import { environment } from '@env/environment';

import * as moment from 'moment';
import { AccountsDatabase } from '@app/services/database/accounts.database';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  syncTitle = 'bills';

  constructor(
    private accountsDatabase: AccountsDatabase,
    private addressDatabase: AddressDatabase,
    private billApi: BillApi,
    private billDatabase: BillDatabase,
    private databaseService: DatabaseService,
    private fileDatabase: FileDatabase,
    private fileService: FileService
  ) {
  }

  async sync(): Promise<boolean> {
    const syncData = {
      bill_entries: await this.databaseService.getUnSynchronized('bill_entries'),
      waiting_for_approval: await this.billDatabase.getWaitingForApproval(),
      hashes: {
        bill_entries: await this.databaseService.getHashes('bill_entries'),
      },
    };

    return this.billApi.sync(syncData)
      .toPromise()
      .then(async (res: ResponseBillApiInterface) => {
        await this.syncStatus(res);

        await this.syncBills(res);

        await this.syncFiles(res);

        return true;
      });
  }

  private async syncStatus(res: ResponseBillApiInterface) {
    if (res?.response?.syncs?.length) {
      const billingEntries = res.response.bill_entries || [];
      const queue = [];

      res.response.syncs.forEach(sync => {
        console.log('sync', sync);

        if (sync.uuid && sync.object_id) {
          queue.push(this.billDatabase.getSqlForUpdateSyncStatus(sync));
        }

        const entryToUpdate = billingEntries
          .filter(function (billingEntry) {
            return billingEntry.id === sync.object_id;
          })
          .pop();

        if (entryToUpdate) {
          queue.push(this.billDatabase.getSqlForUpdateBillId(entryToUpdate.id, entryToUpdate.bill_id));
          queue.push(this.billDatabase.getSqlForUpdateFileObjectId(sync.uuid, entryToUpdate.bill_id));
        }
      });

      console.log('sync entryToUpdate', queue);
      return this.databaseService.bulkQueries(queue);
    }

    return Promise.resolve({});
  }

  private async syncBills(res: ResponseBillApiInterface) {
    if (res?.response?.bill_entries?.length) {
      EventService.syncDetails.next({
        start: moment().toISOString(),
        title: this.syncTitle,
        total: res.response.bill_entries.length,
        done: 0
      });

      const account = await this.accountsDatabase.getActive();

      // get bill entry ids from api response
      const billEntryIds = res.response.bill_entries.map(billEntry => billEntry.id);

      // get existing bill entries map from app db
      const existingBillEntriesHashMap = await this.databaseService.getExistingRecordsAsMap(billEntryIds, 'bill_entries');

      const queue = [];

      res.response.bill_entries.forEach(billEntry => {
        const billEntryId = Number(billEntry.id);

        let query = null;

        billEntry.table_name = 'person';
        billEntry.object_uuid = account?.uuid || null;

        if (existingBillEntriesHashMap.hasOwnProperty(billEntryId)) {
          const existingBillEntry = existingBillEntriesHashMap[billEntryId];

          if (billEntry.hash !== existingBillEntry.hash) {
            query = this.billDatabase.getSqlForUpdateFromApiData(billEntry, {uuid: existingBillEntry.uuid});
          }
        } else {
          query = this.billDatabase.getSqlForCreateFromApiData(billEntry);
        }

        if (query) {
          queue.push(query);
        }
      });

      console.log('syncBills', queue);

      return this.databaseService.bulkQueries(queue);
    }

    return Promise.resolve({});
  }

  private async syncFiles(res: ResponseBillApiInterface) {
    if (res?.response?.files?.length) {
      const queue = [];

      // get bill ids from api response
      const billIds = res.response.files.map(file => file.record_id);
      const fileIds = res.response.files.map(file => file.id);

      const existingBillsHashMap = await this.databaseService.getExistingRecordsAsMap(billIds, 'bill_entries', 'bill_id');
      const existingFilesHashMap = await this.databaseService.getExistingRecordsAsMap(fileIds, 'files');

      res.response.files.forEach(file => {
        if (!existingFilesHashMap.hasOwnProperty(file.id)) {
          if(existingBillsHashMap.hasOwnProperty(file.record_id)) {
              file.object_type = 'person';
              file.object_uuid = existingBillsHashMap[file.record_id].uuid;
              file.object_id = file.record_id;
          }

          queue.push(this.fileService.syncFiles(file));
        }
      });

      return this.databaseService.bulkQueries(queue);
    }

    return Promise.resolve({});
  }

  async getBillsWithPagination(
    filters?: BillEntryFiltersInterface,
    page: number = 1
  ): Promise<{bills: BillEntryInterface[], pagination: PaginationInterface}> {
    const limit = environment.defaultPageSize;

    return {
      bills: await this.billDatabase.getBills(filters, page, limit),
      pagination: await this.billDatabase.getCountBills(filters, page, limit),
    };
  }
}
