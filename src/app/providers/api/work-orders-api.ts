import { Injectable } from '@angular/core';
import { Api } from '@app/providers';
import { Observable } from 'rxjs';
import { SettingsApiResponseInterface } from '@app/providers/api/interfaces/settings-api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class WorkOrdersApi extends Api {
  getSettings(params: any): Observable<SettingsApiResponseInterface> {
    return this.http.post<SettingsApiResponseInterface>(`${this.apiEndpoint}mobile/workorders/sync`, params);
  }
}
