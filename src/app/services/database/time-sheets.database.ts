import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';
import { TimeSheetTypeInterface } from '@app/interfaces/time-sheet-type.interface';

import * as _ from 'underscore';
import * as sqlBuilder from 'sql-bricks';

@Injectable({
  providedIn: 'root'
})
export class TimeSheetsDatabase {
  constructor(private databaseService: DatabaseService) {
  }

}
