import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';
import { TechStatusInterface } from '@app/interfaces/tech-status.interface';
import { TechStatusApiInterface } from '@app/providers/api/interfaces/response-tech-status-api.interface';

import * as sqlBuilder from 'sql-bricks';
import * as _ from 'underscore';

@Injectable({
  providedIn: 'root'
})
export class TechStatusDatabase {
  constructor(private databaseService: DatabaseService) {
  }

  getTechStatuses(): Promise<TechStatusInterface[]> {
    return this.databaseService.findAsArray(`
      select tech_statuses.* 
      from tech_statuses 
    `);
  }

  getTechStatusById(techStatusId): Promise<TechStatusInterface> {
    return this.databaseService.findOrNull(`
      select tech_statuses.* 
      from tech_statuses 
      where id = ?
    `, [
      techStatusId
    ]);
  }

  getTechStatusByWorkOrderUuid(workOrderUuid): Promise<TechStatusInterface> {
    return this.databaseService.findOrNull(`
      select tech_statuses.* 
      from tech_statuses 
      join work_orders on work_orders.tech_status_type_id = tech_statuses.id 
      where work_orders.uuid = ? 
      limit 1`, [
      workOrderUuid
    ]);
  };

  deleteAll(): Promise<any> {
    return this.databaseService.query(`
        delete from tech_statuses
    `);
  }

  async create(techStatus: TechStatusInterface) {
    const query = sqlBuilder.insert('tech_statuses', techStatus);

    return this.databaseService.query(query.toString(), query.toParams());
  }

  async bulkCreate(techStatuses: TechStatusApiInterface[]) {
    const query = [];

    if (!_.isEmpty(techStatuses)) {
      for (const techStatus of techStatuses) {
        query.push(sqlBuilder.insert('tech_statuses', techStatus));
      }

      return this.databaseService.bulkQueries(query);
    }

    return Promise.resolve(null);
  }
}
