import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LogsDatabase } from '@app/services/database/logs.database';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  public logs = [];
  public updateLogs = new BehaviorSubject<boolean | null>(null);

  constructor(private logsDatabase: LogsDatabase) {

  }

  public error(message, error: any, ...data) {
    console.error(message, error, ...data);

    this.logsDatabase.create({
      type: 'error',
      message,
      stack: JSON.stringify(error),
      data: JSON.stringify(data)
    });
  }

  public log(message, ...data) {
    console.log(message, ...data);
  }
}

