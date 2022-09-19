import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { SyncInterface } from '@app/interfaces/sync.interface';
import { EventService } from '@app/services/event.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderService implements SyncInterface {
  syncTitle = 'work orders';

  apiEndpoint = `${environment.apiEndpoint}workorders/`;

  constructor(private http: HttpClient) {
  }

  sync(): Promise<boolean> {
    EventService.syncDetails.next({
      start: moment().toISOString(),
      title: this.syncTitle,
      total: 4,
      done: 0
    });

    return Promise.resolve(true);
  }

  /**
   * Return the list of work orders as observable
   *
   */
  public getList(params?: any) {
    if (params.description && !params.description.includes('%')) {
      params.description = `%${params.description}%`;
    }

    return this.http.get(`${this.apiEndpoint}`, {
      params,
    });
  }

}
