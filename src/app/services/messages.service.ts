import { Injectable } from '@angular/core';
import { MessagesDatabase } from '@app/services/database/messages.database';
import { SettingsService } from '@app/services/settings.service';

import * as moment from 'moment';
import { environment } from '@env/environment';
import { DatabaseService } from '@app/services/database.service';
import { WorkOrderDatabase } from '@app/services/database/workorder.database';
import { SyncInterface } from '@app/interfaces/sync.interface';
import { MessageApi } from '@app/providers/api/message-api';
import { ResponseWorkOrderApiInterface } from '@app/providers/api/interfaces/response-work-order-api.interface';
import { ResponseActivityApiInterface } from '@app/providers/api/interfaces/response-activity-api.interface';
import { EventService } from '@app/services/event.service';
import { MessageInterface } from '@app/interfaces/message.interface';
import { PaginationInterface } from '@app/interfaces/pagination.interface';

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
    tabName?: 'new' | 'completed' | 'sent',
    objectType?: string,
    objectUuid?: string,
    page: number = 1,
    query?: string
  ): Promise<{messages: MessageInterface[], pagination: PaginationInterface}> {
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
        if (sync?.object_uuid && sync?.object_id) {
          queue.push(this.messagesDatabase.getSqlForUpdateActivitySyncStatus(sync));
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
        if (sync?.object_uuid && sync?.object_id) {
          queue.push(this.messagesDatabase.getSqlForUpdateConfirmSyncStatus(sync));
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
        const existingMessageHashMap = await this.messagesDatabase.getExistingMessageAsMap(messageIds);

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
        if (sync?.object_uuid && sync?.object_id) {
          queue.push(this.messagesDatabase.getSqlForUpdateConfirmSyncStatus(sync));
        }
      });

      return this.databaseService.bulkQueries(queue);
    }

    return Promise.resolve({});
  }

// `
//       .then((dataToStore) => {
//         let map = {
//           addresses: {},
//           workorders: {}
//         };
//
//         let queue = [];
//
//         queue.push(DBA.exec('select uuid, work_order_id from work_orders').then((results) => {
//           return DBA.map(results, work_order => map.workorders[work_order.work_order_id] = work_order.uuid);
//         }));
//
//         queue.push(DBA.exec('select uuid, id from addresses').then((results) => {
//           return DBA.map(results, address => map.addresses[address.id] = address.uuid);
//         }));
//
//         return $q.all(queue)
//           .then(result => {
//             dataToStore.map = map;
//
//             return dataToStore;
//           });
//       })
//       .then((dataToStore) => {
//         let messages = dataToStore.activities.data || [];
//         let queue = [];
//
//         angular.forEach(messages, function (message) {
//           let clientAndAddress = '';
//           try {
//             clientAndAddress = JSON.stringify({
//               address_id: message.address_id,
//               address: message.address,
//               city: message.city,
//               customer_name: message.customer_name,
//               state: message.state,
//               zip_code: message.zip_code,
//               latitude: message.latitude,
//               longitude: message.longitude
//             });
//           } catch (err) {
//             Logger.warning('Address to stringify', err);
//           }
//
//           //convert date to utc timezone
//           if (message.created_at && message.created_at !== '0000-00-00 00:00:00') {
//             message.created_at = moment.tz(message.created_at, TIMEZONE).utc().format('YYYY-MM-DD HH:mm:ss');
//           }
//
//           //convert date to utc timezone
//           if (message.updated_at && message.updated_at !== '0000-00-00 00:00:00') {
//             message.updated_at = moment.tz(message.updated_at, TIMEZONE).utc().format('YYYY-MM-DD HH:mm:ss');
//           } else {
//             message.updated_at = message.created_at;
//           }
//
//           console.log('message', message);
//
//           if (dataToStore.existingMessages.hasOwnProperty(message.id)) {
//             if (message.hash && message.hash !== dataToStore.existingMessages[message.id]) {
//               if (message.completed_at === '0000-00-00 00:00:00') {
//                 message.completed_at = message.completed ? message.created_at : null;
//               }
//
//               queue.push(DBA.query(
//                 ' update messages set ' +
//                 ' object_id = ?, work_order_number = ?, created_at = ?, updated_at = ?, type = ?, person_id = ?, creator_person_id = ?, ' +
//                 ' completed = ?, completed_at = ?, client_and_address = ?, hash = ?, address_id = ?, address_name = ?, customer_ids = ?, limit_of_repetitions = ?, interval_type_id = ?, view_type_id = ?, subject = ?, description = ?  ' +
//                 ' where id = ?',
//                 [
//                   message.record_id,
//                   message.work_order_number,
//                   message.created_at,
//                   message.updated_at,
//                   message.type,
//                   message.person_id,
//                   message.creator_person_id,
//                   message.completed,
//                   message.completed_at,
//                   clientAndAddress,
//                   message.hash || null,
//                   message.address_id || null,
//                   message.address_name || null,
//                   message.customer_ids || null,
//                   message.number_of_repetitions || 0,
//                   message.interval_type_id || null,
//                   message.view_type_id || null,
//                   message.subject || null,
//                   message.description || null,
//                   message.id
//                 ]
//               ));
//             } else {
//               // console.log(
//               //   'Omitted update - the message hashes are same',
//               //   message.hash, dataToStore.existingMessages[message.id]
//               // );
//             }
//           } else {
//             let object_uuid = null;
//
//             try {
//               if (message.table_name === 'address') {
//                 object_uuid = dataToStore.map.addresses[message.record_id] || null;
//               } else {
//                 object_uuid = dataToStore.map.workorders[message.record_id] || null;
//               }
//             } catch (err) {
//               object_uuid = null;
//             }
//
//             queue.push(DBA.query(
//               ' insert into messages(' +
//               '   uuid, object_id, object_uuid, person_id, creator_person_id, id, hot, type, subject, description, ' +
//               '   object_type, work_order_number, created_at, updated_at, completed, client_and_address, sync, hash, address_id, address_name, customer_ids, limit_of_repetitions, interval_type_id, view_type_id' +
//               ' ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
//               [
//                 DBA.getUuid(),
//                 message.record_id,
//                 object_uuid,
//                 message.person_id,
//                 message.creator_person_id,
//                 message.id,
//                 message.hot_type_id ? message.hot_type_id : 0,
//                 message.type,
//                 message.subject,
//                 Str.escape(message.description),
//                 message.type === 'activity' ? message.table_name : 'work_order',
//                 message.work_order_number,
//                 message.created_at,
//                 message.updated_at,
//                 message.completed,
//                 clientAndAddress,
//                 1,
//                 message.hash,
//                 message.address_id || null,
//                 message.address_name || null,
//                 message.customer_ids || null,
//                 message.number_of_repetitions || 0,
//                 message.interval_type_id || null,
//                 message.view_type_id || null
//               ]
//             ));
//           }
//         });
//
//         if (queue.length) {
//           return $q.all(queue)
//             .then(() => dataToStore)
//         } else {
//           return $q.resolve(dataToStore);
//         }
//       }).then((dataToStore) => {
//         if (!params.quick_sync) {
//           let workOrderInfoIds = [0];
//           let messages = dataToStore.activities.data || [];
//
//           angular.forEach(messages, function (message) {
//             if (message.id && message.type === 'work_order_info') {
//               workOrderInfoIds.push(message.id)
//             }
//           });
//
//           return DBA.query(`
//   delete
//   from
//   messages
//   where
//   type = 'work_order_info'
//
//   and(
//     id
//
//   is
//   null
//   or
//   id
//   not
//
//   in(${workOrderInfoIds.join(',')})
//
// )
// `).then(() => {
//             return dataToStore;
//           });
//         } else {
//           return dataToStore;
//         }
//       })
//       .then((dataToStore) => {
//
//         let messagesUuid = [];
//
//         angular.forEach(dataToStore.syncs, function (syncData) {
//           messagesUuid.push(syncData.uuid);
//         });
//
//         if (messagesUuid.length) {
//           DBA.query(squel.update().table('messages').set('sync', 1).where('uuid in ?', [messagesUuid]).toString());
//         }
//
//         $rootScope.$broadcast('message.completed');
//
//         return dataToStore;
//       })
//       .then((dataToStore) => {
//         let files = dataToStore.files || [];
//
//         return DBA.findAsArray('select * from files where object_type = "activity"')
//           .then((dbFiles) => {
//             const queue = [];
//
//             files.forEach((file) => {
//               let fileExists = false;
//
//               dbFiles.forEach((dbFile) => {
//                 // Match files by attributes
//                 if (file.crc === dbFile.crc && file.table_name === dbFile.object_type && file.record_id === dbFile.object_id) {
//                   fileExists = true;
//                 }
//               });
//
//               if (!fileExists) {
//                 queue.push(
//                   getById(file.record_id)
//                     .then((message) => {
//                       if (!message) {
//                         return $q.resolve(message);
//                       }
//
//                       let query = squel
//                         .insert()
//                         .into('files')
//                         .set('uuid', DBA.getUuid())
//                         .set('id', file.id)
//                         .set('type', 'photo')
//                         .set('type_id', file.type_id)
//                         .set('filename', file.filename)
//                         .set('object_type', file.table_name)
//                         .set('object_uuid', message.uuid)
//                         .set('object_id', file.record_id)
//                         .set('created_at', file.created_at)
//                         .set('gps_coords', file.gps_location)
//                         .set('description', file.description)
//                         .set('link_person_wo_id', file.link_person_wo_id || null)
//                         .set('sync', 1)
//                         .set('crc', file.crc)
//                         .set('thumbnail', file.link)
//                         .set('hash', file.hash || null)
//                         .toParam();
//
//                       return DBA.query(query.text, query.values);
//                     })
//                 );
//               }
//             });
//
//             return $q.all(queue);
//           });
//       });
//   }
// `

}
