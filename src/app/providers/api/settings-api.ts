import { Injectable } from '@angular/core';
import { Api } from '@app/providers';
import { Observable } from 'rxjs';
import { ResponseSettingsApiInterface } from '@app/providers/api/interfaces/response-settings-api.interface';

@Injectable({
  providedIn: 'root'
})
export class SettingsApi extends Api {
  getSettings(migrationLastId: number | string = null): Observable<ResponseSettingsApiInterface> {
    return this.http.get<ResponseSettingsApiInterface>(`${this.apiEndpoint}mobile/settings?migration_last_id=${migrationLastId}`);
  }
}
