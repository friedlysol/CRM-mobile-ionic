import { Injectable } from '@angular/core';
import { MessagesDatabase } from '@app/services/database/messages.database';
import { SettingsService } from '@app/services/settings.service';
import { environment } from '@env/environment';
import { DatabaseService } from '@app/services/database.service';
import { WorkOrderDatabase } from '@app/services/database/workorder.database';
import { SyncInterface } from '@app/interfaces/sync.interface';
import { MessageApi } from '@app/providers/api/message-api';
import { ResponseActivityApiInterface } from '@app/providers/api/interfaces/response-activity-api.interface';
import { EventService } from '@app/services/event.service';
import { MessageInterface } from '@app/interfaces/message.interface';
import { PaginationInterface } from '@app/interfaces/pagination.interface';

import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class MessagesService implements SyncInterface {
  syncTitle = 'Messages';

  constructor(
    private databaseService: DatabaseService,
    private messageApi: MessageApi,
    private messagesDatabase: MessagesDatabase,
    private settingsService: SettingsService,
    private workOrderDatabase: WorkOrderDatabase
  ) {

  }

  async sync(): Promise<boolean> {
    const syncData = {
      activities: await this.messagesDatabase.getUnSynchronized(),
      confirmations: await this.databaseService.getUnSynchronized('message_confirmations'),
      work_orders: await this.workOrderDatabase.getAllWorkOrderIds(),
      hashes: {
        activities: await this.messagesDatabase.getHashes()
      }
    };

    return this.messageApi.sync(syncData)
      .toPromise()
      .then(async (res: ResponseActivityApiInterface) => {
        await this.syncActivitiesStatus(res);
        await this.syncConfirmationsStatus(res);

        await this.syncActivities(res);
        await this.syncFiles(res);

        return true;
      });
  }

  async getMessagesWithPagination(
    tabName?: string,
    objectType?: string,
    objectUuid?: string,
    page: number = 1,
    query?: string
  ): Promise<{ messages: MessageInterface[], pagination: PaginationInterface }> {
    const limit = environment.defaultPageSize;

    return {
      messages: await this.messagesDatabase.getAllByTab(tabName, objectType, objectUuid, page, limit, query),
      pagination: await this.messagesDatabase.getCountByTab(tabName, objectType, objectUuid, page, limit, query)
    };
  }

  async getInfoMessagesByType(type: string, objectId: number = 0, customerId: string = null) {
    // get messages
    const messages = await this.messagesDatabase.getInfoMessagesByType(type, objectId, customerId);

    // parse messages and set start_interval_date
    messages.map(message => {
      return this.messagesDatabase.getMessageIntervalStart(message);
    });

    const confirmations = {};

    // filter out messages in which the display limit is greater than 0
    const messagesWithLimitOfRepetitions = messages.filter(message => Number(message.limit_of_repetitions) > 0);
    if (messagesWithLimitOfRepetitions.length > 0) {

      // get the number of impressions to date
      const messageConfirmations = await this.messagesDatabase
        .getMessageConfirmations(messagesWithLimitOfRepetitions, customerId);

      messageConfirmations.map(confirmation => {
        confirmations[confirmation.message_id] = confirmation.number_of_repetitions
      });
    }

    // filter out messages that need to be displayed
    return messages.filter(message => {
      const numberOfRepetitions = confirmations.hasOwnProperty(message.id) ? Number(confirmations[message.id]) : 0;

      let nextRepeatInMinutes = 0;

      if (message.view_type !== 'activity_view.work_order') {
        let limitOfRepetitions = this.settingsService.get("message.default_limit_of_repetition_for_day", 16);
        let minutes = 480; //default for 8 hours working time

        switch (message.interval_type) {
          case 'activity_interval.weekly':
            limitOfRepetitions = this.settingsService.get("message.default_limit_of_repetition_for_week", 7);
            minutes = 10080

            break;
          case 'activity_interval.monthly':
            limitOfRepetitions = this.settingsService.get("message.default_limit_of_repetition_for_month", 30);
            minutes = 43200

            break;
        }

        if (Number(message.limit_of_repetitions) > 0) {
          limitOfRepetitions = message.limit_of_repetitions;
        }

        nextRepeatInMinutes = Math.ceil(minutes / Number(limitOfRepetitions));
      }

      const nextRepeatDate = moment()
        .utc()
        .subtract(nextRepeatInMinutes, "minutes")
        .format(environment.databaseDateFormat);

      const exceededLimit = Number(message.limit_of_repetitions) > 0
        && Number(message.limit_of_repetitions) <= numberOfRepetitions;

      return (message.customer_ids === null || message.customer_ids.split(',').includes(customerId))
        && (!exceededLimit && (message.repeat_updated_at === null || message.repeat_updated_at <= nextRepeatDate))
    });
  }

  private async syncActivitiesStatus(res: ResponseActivityApiInterface) {
    if (res?.response?.activities_syncs?.length) {
      const queue = [];
      res.response.activities_syncs.forEach(sync => {
        if (sync.uuid && sync.object_id) {
          queue.push(this.databaseService.getSqlForUpdateSyncStatus('messages', sync));
          queue.push(this.messagesDatabase.getSqlForUpdateFileSyncStatus(sync));
        }
      });

      return this.databaseService.bulkQueries(queue);
    }

    return Promise.resolve({});
  }

  private async syncConfirmationsStatus(res: ResponseActivityApiInterface) {
    if (res?.response?.confirmations_syncs?.length) {
      const queue = [];
      res.response.confirmations_syncs.forEach(sync => {
        if (sync?.uuid && sync?.object_id) {
          queue.push(this.databaseService.getSqlForUpdateSyncStatus('message_confirmations', sync));
        }
      });

      return this.databaseService.bulkQueries(queue);
    }

    return Promise.resolve({});
  }

  private async syncActivities(res: ResponseActivityApiInterface) {
    if (res?.response?.activities?.length) {
      EventService.syncDetails.next({
        start: moment().toISOString(),
        title: this.syncTitle,
        total: res.response.activities.length,
        done: 0
      });

      // get message ids from api response
      const messageIds = res.response.activities.map(activity => activity.id);

      // get existing messages map from app db
      const existingMessageHashMap = await this.databaseService.getExistingRecordsAsMap(messageIds, 'messages');

      const queue = [];

      res.response.activities.forEach(message => {
        const messageId = Number(message.id);

        let query = null;

        if (existingMessageHashMap.hasOwnProperty(messageId)) {
          const existingMessage = existingMessageHashMap[messageId];

          if (message.hash !== existingMessage.hash) {
            query = this.messagesDatabase.getSqlForUpdateFromApiData(message, {uuid: existingMessage.uuid});
          }
        } else {
          query = this.messagesDatabase.getSqlForCreateFromApiData(message);
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

  private async syncFiles(res: ResponseActivityApiInterface) {
    if (res?.response?.files?.length) {
      const queue = [];
      res.response.confirmations_syncs.forEach(sync => {
        if (sync.uuid && sync.object_id) {
          queue.push(this.databaseService.getSqlForUpdateSyncStatus('message_confirmations', sync));
        }
      });

      return this.databaseService.bulkQueries(queue);
    }

    return Promise.resolve({});
  }
}
