import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';
import { SyncApiInterface } from '@app/providers/api/interfaces/sync-api.interface';
import { HashMapInterface } from '@app/interfaces/hash-map.interface';
import { WorkOrderApiInterface } from '@app/providers/api/interfaces/response-work-order-api.interface';
import { WorkOrderInterface } from '@app/interfaces/work-order.interface';

import { environment } from '@env/environment';
import * as sqlBuilder from 'sql-bricks';
import * as _ from 'underscore';
import { isNotNull } from 'sql-bricks';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderDatabase {
  public tableName = 'work_orders';

  private allowFields: Array<string> = [
    'canceled_at',
    'completed_at',
    'conditions_comment',
    'conditions_type_id',
    'confirmed_at',
    'covered_area_type_id',
    'estimated_install_time',
    'exterior_comment',
    'exterior_type_id',
    'foundation_comment',
    'foundation_type_id',
    'hash',
    'payment_capture',
    'status',
    'structure_comment',
    'structure_type_id',
    'sync',
    'tech_status_type_id',
    `covered_area_comment`,
  ];

  constructor(private databaseService: DatabaseService) {
  }

  /**
   * Get wokr orders by tab
   *
   * @param tab
   * @param search
   * @param page
   * @param limit
   */
  getWorkOrdersByTab(tab: string, search: string, page = 1, limit = 50): Promise<WorkOrderInterface[]> {
    const inRoute = environment.techStatuses.inRoute || 0;
    const wip = environment.techStatuses.wip || 0;

    let query = sqlBuilder
      .select(
        'work_orders.*',
        'addresses.address',
        'addresses.city',
        'addresses.state',
        'addresses.zip_code',
        'tech_statuses.name as tech_status',
        'types.type_value as wo_type',
        `case when tech_statuses.id = ${inRoute} or tech_statuses.id = ${wip} then 1 else 0 end as status_type`
      )
      .from('work_orders')
      .leftJoin('addresses', {'work_orders.address_uuid': 'addresses.uuid'})
      .leftJoin('tech_statuses', {'work_orders.tech_status_type_id': 'tech_statuses.id'})
      .leftJoin('types', {'work_orders.wo_type_id': 'types.id'});

    query = this.filterByTab(query, tab);
    query = this.filterBySearch(query, search);

    query.orderBy(['status_type desc', 'work_orders.scheduled_date asc'])

    return this.databaseService.findAsArray(query.toString(), query.toParams());
  }

  getAllForDateRange(startDate: string, endDate: string): Promise<WorkOrderInterface[]> {
    return this.databaseService.findAsArray(`
      select work_orders.*,
        addresses.address,
        addresses.city,
        addresses.state,
        addresses.zip_code,
        tech_statuses.name as tech_status,
        types.type_value as wo_type
      from work_orders
      join addresses on work_orders.address_uuid = addresses.uuid
      join tech_statuses on work_orders.tech_status_type_id = tech_statuses.id
      join types on work_orders.wo_type_id = types.id
      where date(datetime(scheduled_date, 'localtime')) >= date(?) and date(datetime(scheduled_date, 'localtime')) <= date(?)
      order by datetime(scheduled_date) asc      
    `, [
      startDate,
      endDate
    ]);
  };

  getScheduledDateClosestToToday(){
    return this.databaseService.findOrNull(`
      select scheduled_date
      from work_orders
      where scheduled_date is not null
      order by abs(julianday('now') - julianday(scheduled_date)) asc
    `);
  }

  getPreviousClosestScheduledDate(date: string){
    return this.databaseService.findOrNull(`
      select scheduled_date
      from work_orders
      where strftime('%m', date(?)) - strftime('%m', scheduled_date) > 0
      order by abs(julianday('now') - julianday(scheduled_date)) asc
    `, [date]);
  }

  getNextClosestScheduledDate(date: string){
    return this.databaseService.findOrNull(`
      select scheduled_date
      from work_orders
      where strftime('%m', date(?)) - strftime('%m', scheduled_date) < 0
      order by abs(julianday('now') - julianday(scheduled_date)) asc
    `, [date]);
  }

  getTotalWorkOrdersByTab(tab: string, search: string): Promise<number> {
    let query = sqlBuilder
      .select('count(*) as total')
      .from('work_orders')
      .leftJoin('addresses', {'work_orders.address_uuid': 'addresses.uuid'});

    query = this.filterByTab(query, tab);
    query = this.filterBySearch(query, search);

    return this.databaseService
      .findOrNull(query.toString(), query.toParams())
      .then(result => result ? result.total : 0);
  }

  /**
   * Get unsynchronized work orders
   */
  getUnSynchronized(): Promise<WorkOrderInterface[]> {
    return this.databaseService.getUnSynchronized('work_orders');
  }

  getActive() {
    return this.databaseService.findAsArray(`
      select * 
      from work_orders
      where status not in ('canceled', 'completed', 'stock_order')     
    `);
  }

  /**
   * Get all link person wo ids
   */
  getAllLinkPersonWoIds(): Promise<number[]> {
    return this.databaseService
      .findAsArray(`select link_person_wo_id from work_orders`)
      .then(result => {
        if (result) {
          return result.map(item => +item.link_person_wo_id);
        }

        return [];
      });
  }

  /**
   * Get all work order ids
   */
  getAllWorkOrderIds() {
    return this.databaseService
      .findAsArray(`select work_order_id from work_orders`)
      .then(result => {
        if (result) {
          return result.map(item => +item.work_order_id);
        }

        return [];
      });
  }

  /**
   * Get work order record by uuid
   *
   * @param workOrderUuid
   */
  getByUuid(uuid) {
    return this.databaseService.findOrNull(`
      select *, type_value as wo_type
      from work_orders w
      left join types t on w.wo_type_id = t.id
      where uuid = ?
    `, [
      uuid
    ]);
  }

  /**
   * Get a list of other active work orders
   *
   * @param workOrderUuid
   */
  getAnotherActiveWorkOrders(workOrderUuid): Promise<WorkOrderInterface[]> {
    const statuses = [
      environment.techStatuses.inRoute,
      environment.techStatuses.wip
    ];

    let query = sqlBuilder
      .select('*')
      .from('work_orders')
      .where(sqlBuilder.in('tech_status_type_id', statuses))
      .where(sqlBuilder.notEq('uuid', workOrderUuid))

    return this.databaseService.findAsArray(query.toString(), query.toParams());
  };

  /**
   * Update tech status
   *
   * @param workOrderUuid
   * @param techStatusTypeId
   */
  setNewTechStatus(workOrderUuid: string, techStatusTypeId: number) {
    return this.databaseService.query(`
      update work_orders set tech_status_type_id = ?, sync = 0 where uuid = ?
    `, [
      techStatusTypeId, workOrderUuid
    ]);
  }

  createStatusHistory(workOrderUuid: string, currentTechStatusId: number, newTechStatusId: number) {
    return this.databaseService.query(`
      insert into work_order_status_history (
        work_order_uuid, current_tech_status_type_id, previous_tech_status_type_id, sync, created_at, updated_at
      ) values(
        ?, ?, ?, ?, ?, ?
      )
    `, [
      workOrderUuid,
      currentTechStatusId,
      newTechStatusId,
      0,
      this.databaseService.getTimeStamp(),
      this.databaseService.getTimeStamp()
    ]);
  };

  /**
   * Change of order status to confirmed
   *
   * @param workOrderUuid
   */
  confirm(workOrderUuid) {
    return this.databaseService.query(`
      update work_orders set status = ?, sync = 0, confirmed_at = ?, updated_at = ? where uuid = ?
    `, [
      environment.workOrderStatuses.confirmed,
      this.databaseService.getTimeStamp(),
      this.databaseService.getTimeStamp(),
      workOrderUuid
    ]).then(() => environment.workOrderStatuses.confirmed);
  };

  /**
   * Change of order status to completed
   *
   * @param workOrderUuid
   */
  complete(workOrderUuid) {
    return this.databaseService.query(`
      update work_orders set status = ?, sync = 0, completed_at = ?, updated_at = ? where uuid = ?
    `, [
      environment.workOrderStatuses.completed,
      this.databaseService.getTimeStamp(),
      this.databaseService.getTimeStamp(),
      workOrderUuid
    ]);
  };

  /**
   * Update work order data based on allowed columns in allowFields array
   *
   * @param uuid
   * @param workOrderData
   */
  update(uuid, workOrderData: any) {
    const allowData = _.pick(workOrderData, this.allowFields);

    if (!allowData.hasOwnProperty('sync')) {
      allowData.sync = 0;
    }

    allowData.updated_at = this.databaseService.getTimeStamp();

    const query = sqlBuilder
      .update('work_orders', allowData)
      .where({uuid});

    return this.databaseService
      .query(query.toString(), query.toParams());
  }

  /**
   * Remove work_order from uuid
   *
   * @param uuid
   */
  remove(uuid) {
    return this.databaseService.query(`delete from work_orders where uuid = ?`, [uuid]);
  }

  /**
   * Create sql query as string
   *
   * @param workOrder
   */
  getSqlForCreateFromApiData(workOrder: WorkOrderApiInterface) {
    return sqlBuilder.insert('work_orders', Object.assign({
      uuid: this.databaseService.getUuid(),
      created_at: this.databaseService.getTimeStamp(),
      updated_at: null,
      sync: 1
    }, this.workOrderDatabaseObj(workOrder)));
  }

  /**
   * Update sql query as string
   *
   * @param workOrder
   * @param condition
   */
  getSqlForUpdateFromApiData(workOrder: WorkOrderApiInterface, condition = {}) {
    return sqlBuilder
      .update('work_orders', Object.assign({
          updated_at: this.databaseService.getTimeStamp(),
          sync: 1
        }, this.workOrderDatabaseObj(workOrder))
      )
      .where(condition);
  }

  /**
   * Update sync status
   *
   * @param sync
   */
  getSqlForUpdateSyncStatus(sync: SyncApiInterface) {
    return sqlBuilder
      .update('work_orders', {id: sync.object_id, sync: 1})
      .where({uuid: sync.uuid});
  }

  clearHash() {
    return sqlBuilder
      .update('work_orders')
      .set('hash', null);
  }

  private workOrderDatabaseObj(workOrder: WorkOrderApiInterface): WorkOrderInterface {
    return {
      address_id: workOrder.address_id || null,
      address_uuid: workOrder.address_uuid || null,
      assigned_techs_vendors: workOrder.assigned_vendors ? JSON.stringify(workOrder.assigned_vendors) : null,
      call_status: workOrder.call_status || null,
      call_type: workOrder.call_type || null,
      canceled_at: workOrder.canceled_at || null,
      client: workOrder.client || null,
      company_person_id: workOrder.company_person_id || null,
      completed_at: workOrder.completed_at || null,
      conditions_comment: workOrder.conditions_comment || null,
      conditions_type_id: workOrder.conditions_type_id || null,
      confirmed_at: workOrder.confirmed_at || null,
      count_files: workOrder.count_files || 0,
      covered_area_comment: workOrder.covered_area_comment || null,
      covered_area_type_id: workOrder.covered_area_type_id || null,
      current_time_sheet_reason: workOrder.current_time_sheet_reason || null,
      customer_id: workOrder.customer_id || null,
      description: workOrder.description || null,
      estimated_install_time: workOrder.estimated_install_time || null,
      estimated_time: workOrder.estimated_time || null,
      expected_completion_date: workOrder.expected_completion_date || null,
      exterior_comment: workOrder.exterior_comment || null,
      exterior_type_id: workOrder.exterior_type_id || null,
      external_app_url: workOrder.external_app_url || null,
      fax: workOrder.fax || null,
      foundation_comment: workOrder.foundation_comment || null,
      foundation_type_id: workOrder.foundation_type_id || null,
      hash: workOrder.hash || null,
      hazard_assessment: workOrder.hazard_assessment ? JSON.stringify(workOrder.hazard_assessment) : null,
      id: workOrder.link_person_wo_id,
      instruction: workOrder.instructions || null,
      integration_info: workOrder.integration_info || null,
      is_deleted: workOrder.is_deleted || 0,
      ivr_button_label: workOrder.ivr_button_label || null,
      ivr_button_url: workOrder.ivr_button_url || null,
      ivr_from_store: workOrder.ivr_from_store || null,
      ivr_instructions: workOrder.ivr_instructions || null,
      ivr_number: workOrder.ivr_number || null,
      ivr_number_forward: workOrder.ivr_number_forward || null,
      ivr_pin: workOrder.ivr_pin || null,
      link_person_wo_id: workOrder.link_person_wo_id,
      payment_capture: workOrder.payment_capture || null,
      phone: workOrder.phone || null,
      pleatlink_approved: workOrder.pleatlink_approved || null,
      primary_technician: workOrder.primary_technician || null,
      priority: workOrder.priority || null,
      purchase_orders: workOrder.purchase_orders ? JSON.stringify(workOrder.purchase_orders) : null,
      qb_info: workOrder.qb_info || null,
      received_date: workOrder.received_date || null,
      required_asset_files: workOrder.required_asset_files ? JSON.stringify(workOrder.required_asset_files) : null,
      required_completion_code: workOrder.required_completion_code || 0,
      required_labor_files: workOrder.required_labor_files ? JSON.stringify(workOrder.required_labor_files) : null,
      required_validate: workOrder.required_validate ? JSON.stringify(workOrder.required_validate) : null,
      required_work_order_files: workOrder.required_work_order_files ? JSON.stringify(workOrder.required_work_order_files) : null,
      required_work_order_signature: workOrder.required_work_order_signature || 0,
      scheduled_date: workOrder.scheduled_date || null,
      site_issue_required: workOrder.site_issue_required || null,
      site_note: workOrder.site_note || null,
      status: workOrder.status || null,
      structure_comment: workOrder.structure_comment || null,
      structure_type_id: workOrder.structure_type_id || null,
      tech_status_type_id: workOrder.tech_status_type_id || null,
      trade_type_id: workOrder.trade_type_id || null,
      wo_type_id: workOrder.wo_type_id || null,
      work_order_id: workOrder.work_order_id || null,
      work_order_number: workOrder.work_order_number || null,
    };
  }

  private filterByTab(query: sqlBuilder.SelectStatement, tab: string): sqlBuilder.SelectStatement {
    const activeStatuses = ['issued', 'confirmed', 'assigned', 'in_progress', 'in_progress_and_hold'];

    switch (tab) {
      case 'open':
        query = query
          .where(sqlBuilder.in('work_orders.status', activeStatuses));
        break;

      case 'today':
        query = query
          .where(sqlBuilder.in('work_orders.status', activeStatuses))
          .where('date(work_orders.scheduled_date, "localtime")', 'date("now", "localtime")');

        break;

      case 'completed':
        query = query
          .where('work_orders.status', 'completed');
        break;
      case 'calendar':
        query = query
          .where(isNotNull('work_orders.scheduled_date'));
    }

    return query;
  }

  private filterBySearch(query: sqlBuilder.SelectStatement, search: string): sqlBuilder.SelectStatement {
    if (search) {
      search = encodeURI(search);

      query = query.where(sqlBuilder.or(
        sqlBuilder.like('work_orders.work_order_number', '%' + search + '%'),
        sqlBuilder.like('work_orders.client', '%' + search + '%'),
        sqlBuilder.like('work_orders.description', '%' + search + '%'),
        sqlBuilder.like('addresses.address_name', '%' + search + '%'),
      ));
    }

    return query;
  }
}
