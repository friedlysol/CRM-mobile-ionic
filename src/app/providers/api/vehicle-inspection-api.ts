import { Injectable } from '@angular/core';
import { Api } from '@app/providers';
import { Observable } from 'rxjs';
import {
  ResponseVehicleInspectionApiInterface
} from '@app/providers/api/interfaces/response-vehicle-inspection-api.interface';

@Injectable({
  providedIn: 'root'
})
export class VehicleInspectionApi extends Api {
  sync(params: any): Observable<ResponseVehicleInspectionApiInterface> {
    return this.http.post<ResponseVehicleInspectionApiInterface>(`${this.apiEndpoint}mobile/v2/vehicles/inspections/sync`, params);
  }
}
