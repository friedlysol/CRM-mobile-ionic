import { Injectable } from '@angular/core';
import { Api } from '@app/providers';
import { Observable } from 'rxjs';
import { ResponseVehicleApiInterface } from '@app/providers/api/interfaces/response-vehicle-api.interface';

@Injectable({
  providedIn: 'root'
})
export class VehicleApi extends Api {
  sync(params: any): Observable<ResponseVehicleApiInterface> {
    return this.http.post<ResponseVehicleApiInterface>(`${this.apiEndpoint}mobile/v2/vehicles`, params);
  }
}
