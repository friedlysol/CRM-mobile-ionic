import { Injectable } from '@angular/core';
import { Api } from '@app/providers';
import { Observable } from 'rxjs';
import { ResponseTypeApiInterface } from '@app/providers/api/interfaces/response-type-api.interface';

@Injectable({
  providedIn: 'root'
})
export class TypeApi extends Api {
  sync(params: any): Observable<ResponseTypeApiInterface> {
    return this.http.post<ResponseTypeApiInterface>(`${this.apiEndpoint}mobile/v2/types/sync`, params);
  }
}
