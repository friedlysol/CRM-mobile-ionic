import { Injectable } from '@angular/core';
import { Api } from '@app/providers';
import { Observable } from 'rxjs';
import { ResponseTechStatusApiInterface } from '@app/providers/api/interfaces/response-tech-status-api.interface';

@Injectable({
  providedIn: 'root'
})
export class TechStatusApi extends Api {
  sync(params: any): Observable<ResponseTechStatusApiInterface> {
    return this.http.post<ResponseTechStatusApiInterface>(`${this.apiEndpoint}mobile/v2/work-orders/statuses`, params);
  }
}
