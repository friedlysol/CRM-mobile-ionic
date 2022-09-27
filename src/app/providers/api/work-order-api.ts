import { Injectable } from '@angular/core';
import { Api } from '@app/providers';
import { Observable } from 'rxjs';
import { ResponseWorkOrderApiInterface } from '@app/providers/api/interfaces/response-work-order-api.interface';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderApi extends Api {
  sync(params: any): Observable<ResponseWorkOrderApiInterface> {
    return this.http.post<ResponseWorkOrderApiInterface>(`${this.apiEndpoint}mobile/v2/work-orders/sync`, params);
  }
}
