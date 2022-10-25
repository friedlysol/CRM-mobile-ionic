import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';

import * as sqlBuilder from 'sql-bricks';
import { WorkOrderInterface } from '@app/interfaces/work-order.interface';

@Injectable({
  providedIn: 'root'
})
export class MessagesDatabase {
  constructor(private databaseService: DatabaseService) {
  }

  completeByWorkOrder(workOrder: WorkOrderInterface) {
    return this.databaseService.query(`
      update messages set completed = 1, sync = 0, completed_at = ? where object_uuid = ?
    `, [
      this.databaseService.getTimeStamp(),
      workOrder.uuid
    ]);
  }
}
