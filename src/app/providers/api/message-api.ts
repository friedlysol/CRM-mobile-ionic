import { Injectable } from '@angular/core';
import { Api } from '@app/providers';
import { Observable } from 'rxjs';
import { ResponseWorkOrderApiInterface } from '@app/providers/api/interfaces/response-work-order-api.interface';
import { ResponseActivityApiInterface } from '@app/providers/api/interfaces/response-activity-api.interface';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MessageApi extends Api {
  sync(params: any): Observable<ResponseActivityApiInterface> {
    return this.http
      .post<ResponseActivityApiInterface>(`${this.apiEndpoint}mobile/v2/activities/sync`, params)
      .pipe(map(res => {
        if(res.response.hasOwnProperty('syncs')) {
          res.response.activities_syncs = res.response.syncs;
          res.response.syncs = [];
        }

        if(res.response.hasOwnProperty('confirmationSyncs')) {
          res.response.confirmations_syncs = res.response.confirmationSyncs;
          res.response.confirmationSyncs = [];
        }

        return res;
      }));
  }
}
