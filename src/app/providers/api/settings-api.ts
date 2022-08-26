import { Injectable } from '@angular/core';
import { Api } from '@app/providers';
import { Observable } from 'rxjs';
import { SettingsApiResponseInterface } from '@app/providers/api/interfaces/settings-api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class SettingsApi extends Api {
  getSettings(migrationLastId: number | string = null): Observable<SettingsApiResponseInterface> {
    return this.http.get<SettingsApiResponseInterface>(`${this.apiEndpoint}mobile/settings?migration_last_id=${migrationLastId}`);
  }
}
