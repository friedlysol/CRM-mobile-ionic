import { Injectable } from '@angular/core';
import { Api } from '@app/providers';
import { Observable } from 'rxjs';
import { ResponseBillApiInterface } from '@app/providers/api/interfaces/response-bill-api.interface';

@Injectable({
  providedIn: 'root'
})
export class BillApi extends Api {
  sync(params: any): Observable<ResponseBillApiInterface> {
    return this.http.post<ResponseBillApiInterface>(`${this.apiEndpoint}mobile/v2/bills/sync`, params);
  }
}
