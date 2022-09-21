import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';
import { SyncApiInterface } from '@app/providers/api/interfaces/sync-api.interface';
import { HashMapInterface } from '@app/interfaces/hash-map.interface';
import { WorkOrderApiInterface } from '@app/providers/api/interfaces/response-work-order-api.interface';
import { WorkOrderInterface } from '@app/interfaces/work-order.interface';

import * as sqlBuilder from 'sql-bricks';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderDatabase {
  constructor(private databaseService: DatabaseService) {
  }

  /**
   * Get map with uuid and hash
   *
   * @param workOrdersIds
   */
  getExistingWorkOrdersAsMap(workOrdersIds): Promise<Record<string, HashMapInterface>> {
    if (workOrdersIds && Array.isArray(workOrdersIds) && workOrdersIds.length) {
      const query = sqlBuilder
        .select('uuid', 'id', 'hash')
        .from('work_orders')
        .where(sqlBuilder.in('id', ...workOrdersIds));

      return this.databaseService
        .findAsArray(query.toString(), query.toParams())
        .then(workOrders => {
          const workOrdersMap = {};

          if (workOrders && workOrders.length) {
            workOrders.forEach(workOrder => workOrdersMap[Number(workOrder.id)] = {
              hash: workOrder.hash,
              uuid: workOrder.uuid
            });
          }

          return workOrdersMap;
        });
    }

    return Promise.resolve({});
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
    let query = sqlBuilder
      .select(
        'work_orders.*',
        'addresses.address',
        'addresses.city',
        'addresses.state',
        'addresses.zip_code',
        'tech_statuses.name as tech_status'
      )
      .from('work_orders')
      .leftJoin('addresses', {'work_orders.address_uuid': 'addresses.uuid'})
      .leftJoin('tech_statuses', {'work_orders.tech_status_type_id': 'tech_statuses.id'});

    query = this.filterByTab(query, tab);
    query = this.filterBySearch(query, search);

    return this.databaseService.findAsArray(query.toString(), query.toParams());
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
  getUnsynchronized(): Promise<WorkOrderInterface[]> {
    return this.databaseService.findAsArray(`select * from work_orders where sync = 0`);
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
   * Get work order record by uuid
   *
   * @param uuid
   */
  getByUuid(uuid) {
    return this.databaseService.findOrNull(`select * from work_orders where uuid = ?`, [uuid]);
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

  getSqlForUpdateSyncStatus(sync: SyncApiInterface) {
    return sqlBuilder
      .update('work_orders', {id: sync.object_id, sync: 1})
      .where({uuid: sync.object_uuid});
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
      confirmed_at: workOrder.confirmed_at || null,
      count_files: workOrder.count_files || 0,
      current_time_sheet_reason: workOrder.current_time_sheet_reason || null,
      customer_id: workOrder.customer_id || null,
      description: workOrder.description || null,
      estimated_time: workOrder.estimated_time || null,
      expected_completion_date: workOrder.expected_completion_date || null,
      external_app_url: workOrder.external_app_url || null,
      fax: workOrder.fax || null,
      hash: workOrder.hash || null,
      hazard_assessment: workOrder.hazard_assessment ? JSON.stringify(workOrder.hazard_assessment) : null,
      id: workOrder.id,
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
