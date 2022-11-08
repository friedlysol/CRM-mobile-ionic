import { Injectable } from '@angular/core';
import { Api } from '@app/providers';
import { Observable } from 'rxjs';
import { ResponsePersonApiInterface } from '@app/providers/api/interfaces/response-person-api.interface';

@Injectable({
  providedIn: 'root'
})
export class PersonApi extends Api {
  sync(params: any): Observable<ResponsePersonApiInterface> {
    return this.http.post<ResponsePersonApiInterface>(`${this.apiEndpoint}mobile/v2/person/sync`, params);
  }
}
