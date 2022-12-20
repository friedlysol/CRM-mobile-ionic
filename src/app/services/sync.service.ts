import { Injectable } from '@angular/core';
import { EventService } from '@app/services/event.service';
import { SettingsService } from '@app/services/settings.service';
import { WorkOrderService } from '@app/services/workorder.service';
import { TypeService } from '@app/services/type.service';
import { StaticService } from '@app/services/static.service';
import { DatabaseService } from './database.service';
import { HttpClient } from '@angular/common/http';
import { FileService } from './file.service';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { SurveyService } from '@app/services/survey.service';
import { TechStatusService } from '@app/services/tech-status.service';
import { BillService } from '@app/services/bill.service';
import { PersonService } from '@app/services/person.service';
import { VehicleService } from '@app/services/vehicle.service';
import { VehicleInspectionService } from '@app/services/vehicle-inspection.service';
import { MessagesService } from '@app/services/messages.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  constructor(
    private databaseService: DatabaseService,
    private billService: BillService,
    private fileService: FileService,
    private http: HttpClient,
    private messagesService: MessagesService,
    private personService: PersonService,
    private settingsService: SettingsService,
    private staticService: StaticService,
    private surveyService: SurveyService,
    private techStatusService: TechStatusService,
    private typeService: TypeService,
    private vehicleInspectionService: VehicleInspectionService,
    private vehicleService: VehicleService,
    private workOrderService: WorkOrderService,
  ) {
  }

  async sync() {
    EventService.syncInProgress.next(true);

    await this.garbageCollector();

    const syncServices = [
      'settingsService',
      'techStatusService',
      'personService',
      'typeService',
      'vehicleService',
      'workOrderService',
      'surveyService',
      'billService',
      'vehicleInspectionService',
      'messagesService',
      'fileService'
    ]

    for await (const service of syncServices) {
      if(this.hasOwnProperty(service) && typeof this[service].sync === 'function') {
        try {
          console.log('Sync ' + service);

          await this[service].sync();
        } catch (err) {
          console.error('Error in ' + service + ' sync', err);
        }
      }
    }

    EventService.endSync.next(true);
  }

  async exportDatabase() {
    if (!this.staticService.networkStatus.connected) {
      return false;
    }
    await this.databaseService.closeDatabase();

    const copyPath = await Filesystem.copy({
      from: '../databases/database.db',
      to: `database_${new Date().getTime()}.txt`, //files with db extension are not sent, so it was replaced with txt
      directory: Directory.Data,
      toDirectory: Directory.Documents,
    });

    await this.databaseService.openDatabase();
    return await this.fileService.uploadDatabase(copyPath.uri);
  }

  private async garbageCollector() {
    const queries = [
      `delete from addresses where uuid not in (
          select addresses.uuid 
          from work_orders 
          join addresses on (work_orders.address_name = addresses.address_name
        ) and addresses.uuid is not null
        union
          select address_uuid from work_orders where address_uuid is not null
        union
          select address_uuid from assets where address_uuid is not null
        union
          select object_uuid from messages where object_uuid is not null and object_type = 'address'
      )`,

      `delete from asset_changes where sync = 1 and asset_uuid not in (select uuid from assets where uuid not null)`,

      `delete from asset_retake_file where date(updated_at) < date('now', '-7 day') and sync = 1 and file_id is not null`,

      `delete from assets where sync = 1 and address_uuid not in (
          select a.uuid from work_orders wo join addresses a on wo.address_name = a.address_name and a.uuid is not null
        ) and address_uuid not in (
          select a.uuid from surveys s join addresses a on s.address_name = a.address_name and a.uuid is not null
        ) and address_uuid not in (
          select address_uuid from work_orders where address_uuid is not null
        ) and uuid not in (
          select asset_uuid from asset_changes where asset_uuid not null and sync = 0
          union
            select object_uuid from bill_entries where object_uuid is not null and object_type = 'asset' and sync = 0
          union
            select object_uuid from messages where object_uuid is not null and object_type = 'asset' and sync = 0
          union
            select asset_uuid from work_order_assets where asset_uuid is not null and sync = 0
          union
            select object_uuid from files where object_uuid is not null and object_type = 'asset' and sync = 0
        )`,

      `delete from bill_entries where date(created_at) < date('now', '-60 day') and sync = 1 and object_type != 'person'`,

      `delete from bill_entries 
          where date(created_at) < date('now', '-14 day') 
            and sync = 1 and object_type = 'person' 
            and bill_status_type_id not in (
              select id from types where type_key in (
                'bill_status_type.waiting_for_approval', 'bill_status_type.rejected'
              )
            )
      `,

      `delete from daily_inspections where sync = 1 and created_at < date('now', '-30 day')`,

      `delete from gps_locations where sync = 1`,

      `delete from messages where (
        date(completed_at) < date('now', '-30 day') or
        completed_at = 'Invalid date'
      ) and completed_at is not null and sync = 1 and uuid not in (
        select object_uuid from files where object_uuid is not null and object_type = 'activity' and sync = 0
      )`,

      `delete from message_confirmations where work_order_id not in (
          select work_order_id from work_orders where work_order_id is not null
        ) and sync = 1`,

      `delete from surveys where table_name = 'work_order' and record_id not in (
          select work_order_id from work_orders where work_order_id is not null
        )`,

      `delete from survey_questions where survey_id not in (
          select survey_id from surveys where survey_id is not null
        ) or active = 0`,

      `delete from survey_results where sync = 1 and (
            survey_instance_id not in (select survey_instance_id from surveys where survey_instance_id is not null
          ) or survey_question_id not in (
            select survey_question_id from survey_questions where survey_question_id is not null
          )
        ) and date(created_at) < date('now', '-14 day')`,

      `delete from work_order_assets where
        sync = 1 and (
          link_asset_person_wo_id not in (
            select object_uuid from files where object_uuid is not null and object_type = 'link_asset_person_wo' and sync = 0
          ) or
          link_asset_person_wo_id is null
        ) and (
          asset_uuid not in (select uuid from assets) or
          work_order_uuid not in (select uuid from work_orders)
        )`,

      `delete from time_sheet_history where created_at < datetime('now','-2 days') or (
          sync = 1 and
          object_type = 'work_order' and
          object_uuid not in (select uuid from work_orders where uuid is not null)
        )`,

      `delete from time_sheets where sync = 1 and (
            start_at is not null and
            stop_at is not null and
            date(updated_at) < date('now', '-30 day')
        )`,

      `delete from work_order_status_history where sync = 1 and (
          work_order_uuid not in (select uuid from work_orders where uuid is not null) or
          date(created_at) < date('now', '-60 day')
        )`,

      `delete from work_orders where (
          date(completed_at) < date('now', '-14 day') or is_deleted = 1
        ) and uuid not in (
          select work_order_uuid from assets where work_order_uuid is not null and sync = 0
          union
          select object_uuid from messages where object_uuid is not null and object_type = 'work_order' and sync = 0
          union
          select object_uuid from time_sheets where object_uuid is not null and object_type = 'work_order' and sync = 0
          union
          select work_order_uuid from work_order_assets where work_order_uuid is not null and sync = 0
          union
          select work_order_uuid from work_order_status_history where work_order_uuid is not null and sync = 0
        ) and link_person_wo_id not in (
          select object_uuid from files where object_uuid is not null and object_type = 'link_person_wo' and sync = 0
        )`,

      `delete from work_order_labors where
          sync = 1 and
          work_order_id not in (select work_order_id from work_orders where work_order_id is not null) and
          date(created_at) < date('now', '-30 day') and
          uuid not in (select object_uuid from files where object_type = 'link_labor_wo' and sync = 0 and object_uuid is not null)
      `,
      `update work_orders set hash = null where address_uuid not in (select uuid from addresses where uuid is not null)`,
      `update assets set hash = null where address_uuid not in (select uuid from addresses where uuid is not null)`,

      `delete from supplies where sync = 1 and updated_at is not null and date(updated_at) < date('now', '-7 day')`,

      `delete from messages where object_type = 'address' and address_name is not null and address_name not in (
          select address_name from addresses where address_name is not null
        ) and sync = 1`,

      `delete from messages where object_type = 'work_order' and address_name is not null and address_name not in (
          select address_name from work_orders where address_name is not null
        ) and sync = 1`
    ];

    for await (const query of queries) {
      try {
        await this.databaseService.query(query);
      } catch (err) {
        console.error('GarbageCollector query:', err);
      }
    }
  }
}
