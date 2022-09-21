import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SyncInterface } from '@app/interfaces/sync.interface';
import { EventService } from '@app/services/event.service';
import { WorkOrderApi } from '@app/providers/api/work-order-api';
import { ResponseWorkOrderApiInterface } from '@app/providers/api/interfaces/response-work-order-api.interface';
import { WorkOrderDatabase } from '@app/services/database/workorder.database';
import { DatabaseService } from '@app/services/database.service';
import { UtilsService } from '@app/services/utils.service';

import { environment } from '@env/environment';
import * as moment from 'moment';
import { AddressService } from '@app/services/address.service';
import { WorkOrderInterface } from '@app/interfaces/work-order.interface';
import { AddressDatabase } from '@app/services/database/address.database';
import { TabInterface } from '@app/interfaces/tab.interface';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderService implements SyncInterface {
  syncTitle = 'work orders';

  apiEndpoint = `${environment.apiEndpoint}workorders/`;

  constructor(
    private addressDatabase: AddressDatabase,
    private addressService: AddressService,
    private databaseService: DatabaseService,
    private http: HttpClient,
    private utilsService: UtilsService,
    private workOrderApi: WorkOrderApi,
    private workOrderDatabase: WorkOrderDatabase
  ) {
  }

  async sync(): Promise<boolean> {
    const syncData = {
      workorders: await this.workOrderDatabase.getUnsynchronized(),
      link_person_wo_ids: await this.workOrderDatabase.getAllLinkPersonWoIds(),
    };

    return this.workOrderApi.sync(syncData)
      .toPromise()
      .then(async (res: ResponseWorkOrderApiInterface) => {
        await this.syncStatus(res);

        await this.addressService.syncAddresses(res);

        await this.syncWorkOrders(res);

        return true;
      });
  }

  /**
   * Return the list of work orders as observable
   *
   */
  public getWorkOrdersByTab(tab: string, query = '', page = 1, limit = 50): Promise<WorkOrderInterface[]> {
    return this.workOrderDatabase.getWorkOrdersByTab(tab, query, page, limit);
  }

  /**
   * Update total work orders in tabs
   *
   * @param tabs
   * @param query
   */
  public getTotalWorkOrdersByTabs(tabs: TabInterface[], query: string) {
    tabs.map(async tab => tab.total = await this.workOrderDatabase.getTotalWorkOrdersByTab(tab.key, query));

    console.log('tabs', tabs);
  }

  private async syncStatus(res: ResponseWorkOrderApiInterface) {
    if (res?.response?.syncs?.length) {
      const queue = [];
      res.response.syncs.forEach(sync => {
        if (sync?.object_uuid && sync?.object_id) {
          queue.push(this.workOrderDatabase.getSqlForUpdateSyncStatus(sync));
        }
      });

      return this.databaseService.bulkQueries(queue);
    }

    return Promise.resolve({});
  }

  private async syncWorkOrders(res: ResponseWorkOrderApiInterface) {
    if (res?.response?.workorders?.length) {
      EventService.syncDetails.next({
        start: moment().toISOString(),
        title: this.syncTitle,
        total: res.response.workorders.length,
        done: 0
      });

      // get work order ids from api response
      const workOrderIds = res.response.workorders.map(workOrder => workOrder.id);

      // get existing work orders map from app db
      const existingWorkOrdersHashMap = await this.workOrderDatabase.getExistingWorkOrdersAsMap(workOrderIds);

      // get address ids from api response
      const addressIds = res.response.workorders.map(workOrder => workOrder.address_id);

      // get existing addresses map from app db
      const existingAddressesHashMap = await this.addressDatabase.getExistingAddressesAsMap(addressIds);

      const queue = [];

      res.response.workorders.forEach(workOrder => {
        const addressId = Number(workOrder.address_id);
        const workOrderId = Number(workOrder.id);

        if(existingAddressesHashMap.hasOwnProperty(addressId)) {
          //set address_uuid to based on address_id
          workOrder.address_uuid = existingAddressesHashMap[addressId].uuid;
        }

        let query = null;

        if (existingWorkOrdersHashMap.hasOwnProperty(workOrderId)) {
          const existingWorkOrder = existingWorkOrdersHashMap[workOrder.id];

          if (workOrder.hash !== existingWorkOrder.hash) {
            query = this.workOrderDatabase.getSqlForUpdateFromApiData(workOrder, {uuid: existingWorkOrder.uuid});
          }
        } else {
          query = this.workOrderDatabase.getSqlForCreateFromApiData(workOrder);
        }

        if (query) {
          queue.push(query);
        }
      });

      console.log('syncWorkOrders', queue);

      return this.databaseService.bulkQueries(queue);
    }

    return Promise.resolve({});
  }
}
