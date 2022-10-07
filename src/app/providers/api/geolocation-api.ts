import { Injectable } from '@angular/core';
import { Api } from '@app/providers';
import { Observable } from 'rxjs';
import { ResponseGeolocationApiInterface } from '@app/providers/api/interfaces/response-geolocation-api.interface';

@Injectable({
  providedIn: 'root'
})
export class GeolocationApi extends Api {
  sync(params: any): Observable<ResponseGeolocationApiInterface> {
    return this.http.post<ResponseGeolocationApiInterface>(`${this.apiEndpoint}mobile/v2/geolocation/sync`, params);
  }
}
