import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';
import { WorkOrderInterface } from '@app/interfaces/work-order.interface';
import { MessageInterface, MessageRepeat } from '@app/interfaces/message.interface';
import { AccountsDatabase } from '@app/services/database/accounts.database';
import { environment } from '@env/environment';

import * as moment from 'moment';
import * as sqlBuilder from 'sql-bricks';
import * as _ from 'underscore';
import { SyncApiInterface } from '@app/providers/api/interfaces/sync-api.interface';
import { HashMapInterface } from '@app/interfaces/hash-map.interface';
import { ActivityApiInterface } from '@app/providers/api/interfaces/response-activity-api.interface';
import { UtilsService } from '@app/services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class MessagesDatabase {
  constructor(
    private accountsDatabase: AccountsDatabase,
    private databaseService: DatabaseService,
    private utilsService: UtilsService
  ) {
  }

  getUnSynchronized() {
    const query = sqlBuilder
      .select()
      .from('messages')
      .where('sync', 0)
      .where(sqlBuilder.notEq('description', ''))

    return this.databaseService.findAsArray(query.toString(), query.toParams());
  }

  getHashes(): Promise<Record<number, string>> {
    const query = sqlBuilder
      .select('id', 'hash', 'type')
      .from('messages')
      .where(sqlBuilder.isNotNull('hash'));

    return this.databaseService
      .findAsArray(query.toString(), query.toParams())
      .then(result => {
        const hashMapped = {};

        result.map(item => hashMapped[item.id] = item.type === 'work_order_info' ? '-' : item.hash);

        return hashMapped;
      });
  }

  getById(messageId): Promise<MessageInterface> {
    return this.databaseService.findOrNull('select * from messages where id = ?', [messageId]);
  }

  getByUuid(messageUuid): Promise<MessageInterface> {
    return this.databaseService.findOrNull(`
      select 
        messages.*, 
        persons.first_name as person_first_name, 
        persons.last_name as person_last_name,
        from_persons.id as from_person_id, 
        from_persons.first_name as from_person_first_name, 
        from_persons.last_name as from_person_last_name,
                (
          select count(1) as total
          from files
          where files.object_uuid = messages.uuid and files.object_type = 'activity' and files.is_deleted = 0
        ) as total_photos
      from messages
      left join persons from_persons on from_persons.id = messages.creator_person_id
      left join persons on persons.id = messages.person_id  
      where messages.uuid = ?
    `, [
      messageUuid
    ]);
  }

  /**
   * Get all messages by objectUuid
   * @param objectUuid
   */
  getByObjectUuid(objectUuid) {
    return this.databaseService.findAsArray(`
      select 
        messages.*, 
        persons.first_name as person_first_name, 
        persons.last_name as person_last_name,
        from_persons.id as from_person_id, 
        from_persons.first_name as from_person_first_name, 
        from_persons.last_name as from_person_last_name,
                (
          select count(1) as total
          from files
          where files.object_uuid = messages.uuid and files.object_type = 'activity' and files.is_deleted = 0
        ) as total_photos
      from messages
      left join persons from_persons on from_persons.id = messages.creator_person_id
      left join persons on persons.id = messages.person_id
      where messages.object_uuid = ?
      order by datetime(messages.created_at) desc
    `, [
      objectUuid
    ]);
  }

  /**
   * Get all messages by tab name and objectType with objectUuid
   *
   * @param tabName
   * @param objectType
   * @param objectUuid
   * @param page
   * @param limit
   */
  async getAllByTab(
    tabName?: 'new' | 'completed' | 'sent',
    objectType?: string,
    objectUuid?: string,
    page: number = 1,
    limit: number = 15,
    search?: string
  ): Promise<MessageInterface[]> {
    let query = `
      select 
        messages.*, 
        work_orders.work_order_number,
        work_orders.client,  
        work_order_addresses.address as work_order_address, 
        work_order_addresses.zip_code as work_order_zip_code, 
        work_order_addresses.state as work_order_state, 
        work_order_addresses.city as work_order_city, 
        addresses.address as address, 
        addresses.zip_code as zip_code, 
        addresses.state as state, 
        addresses.city as city,
        persons.first_name as person_first_name,
        persons.last_name as person_last_name, 
        from_persons.id as from_person_id,
        from_persons.first_name as from_person_first_name, 
        from_persons.last_name as from_person_last_name,
        (
          select count(1) as total
          from files
          where files.object_uuid = messages.uuid and files.object_type = 'activity' and files.is_deleted = 0
        ) as total_photos
      from messages
      left join persons from_persons on from_persons.id = messages.creator_person_id
      left join persons on persons.id = messages.person_id
      left join work_orders on (
        messages.object_type = 'work_order' and messages.object_uuid = work_orders.uuid 
      )
      left join addresses work_order_addresses on work_order_addresses.uuid = work_orders.address_uuid
      left join addresses on ( 
        messages.object_type = 'address' and (
          messages.address_name = addresses.address_name or messages.object_uuid = addresses.uuid
        ) 
      )
    `;

    const filters = await this.getFiltersForMessages(tabName, objectType, objectUuid, search);

    query += filters.query;
    query += ` order by messages.created_at desc`

    if (limit) {
      query += ` limit ${limit} offset ${(page - 1) * limit}`
    }

    return this.databaseService.findAsArray(query, filters.params)
      .then((messages: MessageInterface[]) => {
        messages = messages.map(message => {
          try {
            message.client_and_address = JSON.parse(message.client_and_address);
          } catch (e) {
            message.client_and_address = {};
          }

          return message;
        });

        return messages;
      });
  }

  /**
   * Get all messages by tab name and objectType with objectUuid
   *
   * @param tabName
   * @param objectType
   * @param objectUuid
   * @param page
   * @param limit
   */
  async getCountByTab(
    tabName?: 'new' | 'completed' | 'sent',
    objectType?: string,
    objectUuid?: string,
    page: number = 1,
    limit: number = 15,
    search?: string
  ): Promise<any> {
    let query = `
      select count(*) as total from messages
    `;

    const filters = await this.getFiltersForMessages(tabName, objectType, objectUuid, search);

    query += filters.query;

    return this.databaseService.findOrNull(query, filters.params)
      .then((result: any) => {
        const total = result?.total || 0;

        return this.utilsService.getPagination(total, page, limit);
      });
  }

  async getFiltersForMessages(
    tabName?: 'new' | 'completed' | 'sent',
    objectType?: string,
    objectUuid?: string,
    search?: string
  ): Promise<{ query: string, params: Array<any> }> {
    const account = await this.accountsDatabase.getActive();

    const params: Array<any> = [];

    let query = '';

    if (tabName) {
      params.push(account.person_id);

      switch (tabName) {
        case 'new': {
          query += 'where messages.completed = 0 and messages.creator_person_id != ?';

          break;
        }
        case 'completed': {
          query += 'where messages.completed = 1 and messages.creator_person_id != ?';

          break;
        }
        case 'sent': {
          query += 'where messages.creator_person_id = ?';

          break;
        }
      }
    } else {
      query += 'where messages.uuid is not null';
    }

    if (objectType && objectUuid) {
      params.push(objectUuid);

      if (objectType === 'work_order') {
        query += ` and (
          messages.object_uuid = ? or messages.address_id = (
            select address_id from work_orders wo1 where wo1.uuid = ?
          )
        )`;

        params.push(objectUuid);
      } else {
        query += `and messages.object_uuid = ?`;
      }

      query += `and messages.object_type = ?`;
      params.push(objectType);
    } else {
      query += `and messages.object_type is null`;
    }

    if(search) {
      query += ` and messages.description like ?`;
      params.push('%' + search + '%');
    }

    return {
      query,
      params
    }
  }

  /**
   * Set message as completed & queue to sync
   *
   * @param message
   */
  complete(message) {
    return this.databaseService.query(`
      update messages set completed = 1, sync = 0, completed_at = ? 
      where uuid = ?
    `, [
      this.databaseService.getTimeStamp(),
      message.uuid
    ]);
  }

  /**
   * Set message as completed & queue to sync
   *
   * @param workOrder
   */
  completeByWorkOrder(workOrder: WorkOrderInterface): Promise<any> {
    return this.databaseService.query(`
      update messages set completed = 1, sync = 0, completed_at = ? where object_uuid = ?
    `, [
      this.databaseService.getTimeStamp(),
      workOrder.uuid
    ]);
  }

  /**
   *
   * @param type
   * @param objectId
   * @param customerId
   */
  async getInfoMessagesByType(type: string, objectId: number, customerId: string): Promise<MessageInterface[]> {
    const params = [];

    let query = `
      select messages.uuid,
        messages.id,
        messages.subject,
        messages.description,
        messages.customer_ids,
        view_types.type_key as view_type,
        interval_types.type_key as interval_type,
        ifnull(messages.limit_of_repetitions, 0) as limit_of_repetitions,
        ifnull(message_repeats.number_of_repetitions, 0) as number_of_repetitions,
        message_repeats.updated_at as repeat_updated_at
      from messages
      left join types as view_types on messages.view_type_id = view_types.id
      left join types as interval_types on messages.interval_type_id = interval_types.id
      left join message_repeats on messages.id = message_repeats.message_id
      where (
        (
          messages.subject is not null and messages.subject != ''
        ) or (
          messages.description is not null and messages.description != ''
        )
      )
    `;

    if (type === 'activity_view.work_order') {
      query += ` 
        and (
          view_types.type_key = ? or (
            messages.type = 'work_order_info' and 
            view_types.type_key is null
          )
        ) and messages.id not in (
          select message_id from message_confirmations where work_order_id = ?
        )
      `;

      params.push(type);
      params.push(objectId);
    } else {
      query += ` and view_types.type_key = ?`;

      params.push(type);
    }

    if (customerId) {
      query += ` and ( messages.customer_ids = ? or messages.customer_ids is null or messages.customer_ids like ? )`;

      params.push(customerId);
      params.push('%' + customerId + '%');
    }

    return this.databaseService.findAsArray(query, params);
  }

  /**
   * Create message
   *
   * @param message
   */
  async create(message: MessageInterface): Promise<MessageInterface> {
    const account = await this.accountsDatabase.getActive();

    if (!message.uuid) {
      message.uuid = this.databaseService.getUuid();
    }

    const query = sqlBuilder.insert('messages', Object.assign({
        uuid: message.uuid,
        person_id: message.person_id || null,
        creator_person_id: account.person_id,
        type: message.type || null,
        subject: message.subject || null,
        description: message.description || null,
        hot: message.hot || 0,
        object_type: message.object_type || null,
        object_uuid: message.object_uuid || null,
        object_id: message.object_id || null,
        sync: 0,
        created_at: this.databaseService.getTimeStamp()
      })
    );

    return this.databaseService.query(query.toString(), query.toParams())
      .then(() => this.getByUuid(message.uuid));
  }

  /**
   * Update message
   *
   * @param message
   */
  update(message: MessageInterface) {
    const query = sqlBuilder
      .update('messages', Object.assign({
          sync: 0,
          updated_at: this.databaseService.getTimeStamp()
        }, _.pick(message, ['hot', 'description']))
      )
      .where('uuid', message.uuid);

    return this.databaseService.query(query.toString(), query.toParams());
  }

  async confirmInfoMessage(
    message: MessageInterface,
    type: string,
    objectId: number = null,
    customerId: string = null
  ): Promise<any> {
    await this.databaseService.query(`
      insert into 
      message_confirmations (uuid, message_uuid, message_id, work_order_id, created_at)
      values (?, ?, ?, ?, ?)
    `, [
      this.databaseService.getUuid(),
      message.uuid,
      message.id,
      objectId,
      this.databaseService.getTimeStamp()
    ]);

    message = this.getMessageIntervalStart(message);

    let params = [message.start_interval_date, message.id];
    let query = `
        select uuid, message_id, number_of_repetitions
        from message_repeats
        where created_at > ? and message_id = ?
    `;

    if (customerId) {
      query += ` and customer_id = ?`;
      params.push(customerId);
    }

    const messageRepeat = await this.databaseService.findOrNull(query, params) as MessageRepeat
    if (messageRepeat) {
      return this.updateMessageRepeat(messageRepeat.uuid, Number(messageRepeat.number_of_repetitions) + 1);
    } else {
      return this.createMessageRepeat(message.id, customerId);
    }
  }

  /**
   * Get unread messages count for related object (eq. work_order)
   *
   * @param objectUuid
   */
  async getUnreadCountForObjectUuid(objectUuid): Promise<number> {
    const account = await this.accountsDatabase.getActive();

    return this.databaseService
      .findOrNull(`
        select count(1) as unreadCount 
        from messages
        where completed = 0 and creator_person_id != ? and object_uuid = ? and person_id = (
          select person_id from accounts limit 1
        )
      `, [
          account.person_id,
          objectUuid
        ]
      )
      .then(result => result ? result.unreadCount : 0);
  }

  /**
   * Get overall unread count
   */
  async getUnreadCount(): Promise<number> {
    const account = await this.accountsDatabase.getActive();

    return this.databaseService
      .findOrNull(`
        select count(1) as unread 
        from messages 
        where completed = 0 and person_id = ? and 
        creator_person_id != ?
      `, [
        account.person_id,
        account.person_id
      ])
      .then(result => result ? result.unreadCount : 0);
  };

  /**
   *
   * @param workOrderId
   * @param customerId
   */
  getWorkOrderInfoMessages(workOrderId: number, customerId: string = null): Promise<MessageInterface[]> {
    return this.databaseService.findAsArray(`
      select messages.uuid,
        messages.id,
        messages.subject,
        messages.description,
        messages.customer_ids,
        ifnull(messages.limit_of_repetitions, 0) as limit_of_repetitions,
        ifnull(message_repeats.number_of_repetitions, 0) as number_of_repetitions
      from messages
      left join message_repeats on messages.id = message_repeats.message_id and message_repeats.customer_id = ?
      where type = 'work_order_info'
        and (
          messages.object_id = ? or
          messages.customer_ids is null or
          messages.customer_ids like ?
        )
        and messages.id not in (
          select message_id from message_confirmations where work_order_id = ?
        )
        and (
          (
            messages.subject is not null and
            messages.subject != ''
          ) or (
            messages.description is not null and
            messages.description != ''
          )
        )
    `, [
      customerId,
      workOrderId,
      '%' + customerId + '%',
      workOrderId
    ]).then(messages => {
      return messages.filter(message => {
        const hasCustomer = message.customer_ids.split(',').includes(customerId);
        const exceededLimit = parseInt(message.limit_of_repetitions) > 0
          && parseInt(message.limit_of_repetitions) <= parseInt(message.number_of_repetitions);

        return (message.customer_ids === null || hasCustomer) && !exceededLimit;
      });
    })
  }

  /**
   *
   * @param message
   */
  getMessageIntervalStart(message: MessageInterface): MessageInterface {
    switch (message.interval_type) {
      case 'activity_interval.daily':
        message.start_interval_date = moment()
          .startOf('day')
          .format(environment.databaseDateFormat);

        break;
      case 'activity_interval.weekly':
        message.start_interval_date = moment()
          .startOf('week')
          .format(environment.databaseDateFormat);

        break;
      case 'activity_interval.monthly':
        message.start_interval_date = moment()
          .startOf('month')
          .format(environment.databaseDateFormat);

        break;
      default:
        message.start_interval_date = moment()
          .subtract(1, 'year')
          .format(environment.databaseDateFormat);

        break;
    }

    return message;
  }

  /**
   *
   * @param messageId
   * @param customerId
   */
  createMessageRepeat(messageId: number, customerId: string = null): Promise<any> {
    return this.databaseService.query(`
        insert into 
        message_repeats (uuid, message_id, customer_id, number_of_repetitions, created_at, updated_at)
        values (?, ?, 1, ?, ?, ?)
    `, [
      this.databaseService.getUuid(),
      messageId,
      customerId,
      this.databaseService.getTimeStamp(),
      this.databaseService.getTimeStamp()
    ]);
  }

  /**
   *
   * @param messageRepeatUuid
   * @param numberOfRepetitions
   */
  updateMessageRepeat(messageRepeatUuid: string, numberOfRepetitions: number): Promise<any> {
    return this.databaseService.query(`
      update message_repeats set number_of_repetitions = ?, updated_at = ? 
      where uuid = ?
    `, [
      numberOfRepetitions,
      this.databaseService.getTimeStamp(),
      messageRepeatUuid
    ]);
  }

  /**
   *
   * @param messages
   * @param customerId
   */
  getMessageConfirmations(messages: MessageInterface[], customerId: string = null) {
    const conditions = [];

    messages.forEach(message => {
      conditions.push(sqlBuilder.and({
        created_at: message.start_interval_date,
        message_id: message.id
      }));
    })

    let query = sqlBuilder
      .select('message_id', 'number_of_repetitions')
      .from('message_repeats')

    if (customerId) {
      query = query.where('customer_id', customerId);
    }

    query = query.where(sqlBuilder.or(conditions));

    return this.databaseService.findAsArray(query.toString(), query.toParams());
  }

  getSqlForUpdateActivitySyncStatus(sync: SyncApiInterface) {
    return sqlBuilder
      .update('messages', {id: sync.object_id, sync: 1})
      .where('uuid', sync.uuid);
  }

  getSqlForUpdateConfirmSyncStatus(sync: SyncApiInterface) {
    return sqlBuilder
      .update('message_confirmations', {id: sync.object_id, sync: 1})
      .where('uuid', sync.uuid);
  }

  getSqlForUpdateFileSyncStatus(sync: SyncApiInterface) {
    return sqlBuilder
      .update('files', {object_id: sync.object_id, sync: 1})
      .where('uuid', sync.uuid)
      .where('object_type', 'activity');
  }

  getSqlForCreateFromApiData(message: ActivityApiInterface) {
    return sqlBuilder.insert('messages', Object.assign({
      uuid: this.databaseService.getUuid(),
      created_at: this.databaseService.getTimeStamp(),
      updated_at: null,
      sync: 1
    }, this.messageDatabaseObj(message)));
  }

  getSqlForUpdateFromApiData(message: ActivityApiInterface, condition = {}) {
    return sqlBuilder
      .update('work_orders', Object.assign({
          updated_at: this.databaseService.getTimeStamp(),
          sync: 1
        }, this.messageDatabaseObj(message))
      )
      .where(condition);
  }

  private messageDatabaseObj(message: ActivityApiInterface): MessageInterface {
    return {
      id: message.id,
      person_id: message.id,
      creator_person_id: message.creator_person_id,
      subject: message.subject,
      description: message.description,
      hot: message.hot,
      object_type: message.table_name,
      object_uuid: null,
      object_id: message.record_id,
      address_id: message.address_id,
      address_name: message.address_name,
      customer_ids: message.customer_ids,
      type: message.type,
      work_order_number: message.work_order_number,
      // client_and_address: message.c,
      view_type_id: message.view_type_id,
      interval_type_id: message.interval_type_id,
      // limit_of_repetitions: message.,
      hash: message.hash,
      completed: message.completed,
      completed_at: message.completed_at,
    };
  }
}
