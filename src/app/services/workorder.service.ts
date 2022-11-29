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
import { TimeSheetsDatabase } from '@app/services/database/time-sheets.database';
import { TypeService } from '@app/services/type.service';
import { TechStatusDatabase } from '@app/services/database/tech-status.database';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SettingsService } from '@app/services/settings.service';
import { TechStatusInterface } from '@app/interfaces/tech-status.interface';
import { MessagesDatabase } from '@app/services/database/messages.database';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderService implements SyncInterface {
  syncTitle = 'work orders';

  constructor(
    private addressDatabase: AddressDatabase,
    private addressService: AddressService,
    private alertController: AlertController,
    private databaseService: DatabaseService,
    private http: HttpClient,
    private messagesDatabase: MessagesDatabase,
    private router: Router,
    private settingsService: SettingsService,
    private techStatusDatabase: TechStatusDatabase,
    private timeSheetsDatabase: TimeSheetsDatabase,
    private typeService: TypeService,
    private utilsService: UtilsService,
    private workOrderApi: WorkOrderApi,
    private workOrderDatabase: WorkOrderDatabase
  ) {
  }

  async sync(params = {}): Promise<boolean> {
    const syncData = {
      workorders: await this.databaseService.getUnSynchronized('work_orders'),
      //status_history: await this.databaseService.getUnSynchronized('work_order_status_history'),
      link_person_wo_ids: await this.workOrderDatabase.getAllLinkPersonWoIds(),
      hashes: {
        workorders: await this.databaseService.getHashes('work_orders'),
      },
    };

    return this.workOrderApi.sync(Object.assign(syncData, params))
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
  getWorkOrdersByTab(tab: string, query = '', page = 1, limit = 50): Promise<WorkOrderInterface[]> {
    return this.workOrderDatabase.getWorkOrdersByTab(tab, query, page, limit);
  }

  /**
   * Update total work orders in tabs
   *
   * @param tabs
   * @param query
   */
  getTotalWorkOrdersByTabs(tabs: TabInterface[], query: string) {
    tabs.map(async tab => tab.total = await this.workOrderDatabase.getTotalWorkOrdersByTab(tab.key, query));

    console.log('tabs', tabs);
  }

  async getUnSynchronizedWorkOrders() {
    return await this.workOrderDatabase.getUnSynchronized();
  }

  async clearHash() {
    return await this.workOrderDatabase.clearHash();
  }

  workOrderDataValidation(workOrder: WorkOrderInterface) {
    return Promise.resolve(true);
  }

  async checkIfAnotherWorkOrderIsActive(workOrder: WorkOrderInterface): Promise<boolean> {
    const activeStatuses = [environment.techStatuses.wip, environment.techStatuses.inRoute];

    const getAnotherActiveWorkOrders = await this.workOrderDatabase.getAnotherActiveWorkOrders(workOrder.uuid);

    // Check if we have another active work orders
    if (getAnotherActiveWorkOrders.length && activeStatuses.includes(workOrder.tech_status_type_id)) {
      const anotherRunningWorkOrder = getAnotherActiveWorkOrders[0];

      const alert = await this.alertController.create({
        header: `You can't start this work order`,
        message: `
          You can't start this work order since another work order\n 
          (#${anotherRunningWorkOrder.work_order_number}) is active
        `,
        cssClass: 'form-alert',
        buttons: [
          {
            text: 'Work Order',
            cssClass: 'alert-button-cancel',
            handler: (value: any) => {
              this.router.navigateByUrl('/work-order/view/' + anotherRunningWorkOrder.uuid);
            }
          },
          {
            text: 'Ok',
            cssClass: 'alert-button-confirm',
          },
        ],
        backdropDismiss: false
      });

      await alert.present();

      return new Promise((resolve) => {
        alert.onDidDismiss().then((res) => {
          resolve(true);
        });
      });
    }

    return Promise.resolve(false);
  }

  async confirmToChangeStatus() {
    const alert = await this.alertController.create({
      header: `Confirm status change`,
      message: `Are you sure you wish to change Work Order status?`,
      cssClass: 'form-alert',
      buttons: [
        {
          text: 'No',
          cssClass: 'alert-button-cancel',
          role: 'no'
        },
        {
          text: 'Yes',
          cssClass: 'alert-button-confirm',
          role: 'yes'
        },
      ],
      backdropDismiss: false
    })

    await alert.present();

    return new Promise((resolve) => {
      alert.onDidDismiss().then((res) => {
        resolve(res.role === 'yes');
      });
    });
  }

  async checkIfCanStartAnotherTimesheet(workOrder: WorkOrderInterface) {
    const runningTimeSheets = await this.timeSheetsDatabase.getAllRunningTimeSheets();
    const onlyOneActiveTimer = this.settingsService.check('work_order.only_one_active_timer', 1);

    if (onlyOneActiveTimer) {
      if (runningTimeSheets.length) {
        const alert = await this.alertController.create({
          header: `You can't start this work order`,
          message: `Another work order is active. Check in Menu/Time sheet`,
          cssClass: 'form-alert',
          buttons: [
            {
              text: 'Time sheet',
              cssClass: 'alert-button-cancel',
              handler: (value: any) => {
                this.router.navigateByUrl('/time-sheets/list');
              }
            },
            {
              text: 'Ok',
              cssClass: 'alert-button-confirm'
            },
          ],
          backdropDismiss: false
        });

        await alert.present();

        return new Promise((resolve) => {
          alert.onDidDismiss().then((res) => {
            resolve(false);
          });
        });
      }
    }

    return Promise.resolve(true);
  }

  /**
   * Set new status for work order and save changes in work_order_status_history
   *
   * @param workOrder
   * @param currentTechStatus
   */
  async setNewTechStatus(
    workOrder: WorkOrderInterface,
    currentTechStatus: TechStatusInterface
  ): Promise<TechStatusInterface> {
    if(workOrder.tech_status_type_id === currentTechStatus.id) {
      return currentTechStatus;
    }

    await this.workOrderDatabase.setNewTechStatus(workOrder.uuid, workOrder.tech_status_type_id);
    await this.workOrderDatabase.createStatusHistory(workOrder.uuid, currentTechStatus.id, workOrder.tech_status_type_id);

    return this.techStatusDatabase.getTechStatusById(workOrder.tech_status_type_id);
  }

  changeStatusToConfirmed(workOrder: WorkOrderInterface) {
    return this.workOrderDatabase.confirm(workOrder.uuid)
  };

  async changeStatusToComplete(workOrder: WorkOrderInterface) {
    if (this.settingsService.check('message.set_completed_flag_after_finished_wo', 0)) {
      await this.messagesDatabase.completeByWorkOrder(workOrder);
    }

    await this.workOrderDatabase.complete(workOrder.uuid);

    return this.timeSheetsDatabase.stopForWorkOrder(workOrder);
  };

  private async syncStatus(res: ResponseWorkOrderApiInterface) {
    if (res?.response?.syncs?.length) {
      const queue = [];
      res.response.syncs.forEach(sync => {
        if (sync?.uuid && sync?.object_id) {
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
      const workOrderIds = res.response.workorders.map(workOrder => workOrder.link_person_wo_id);

      // get existing work orders map from app db
      const existingWorkOrdersHashMap = await this.databaseService.getExistingRecordsAsMap(workOrderIds, 'work_orders');

      // get address ids from api response
      const addressIds = res.response.workorders.map(workOrder => workOrder.address_id);

      // get existing addresses map from app db
      const existingAddressesHashMap = await this.databaseService.getExistingRecordsAsMap(addressIds, 'addresses');

      const queue = [];

      res.response.workorders.forEach(workOrder => {
        const addressId = Number(workOrder.address_id);
        const workOrderId = Number(workOrder.link_person_wo_id);

        if (existingAddressesHashMap.hasOwnProperty(addressId)) {
          //set address_uuid to based on address_id
          workOrder.address_uuid = existingAddressesHashMap[addressId].uuid;
        }

        let query = null;

        if (existingWorkOrdersHashMap.hasOwnProperty(workOrderId)) {
          const existingWorkOrder = existingWorkOrdersHashMap[workOrder.link_person_wo_id];

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
