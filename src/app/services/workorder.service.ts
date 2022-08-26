import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderService {
  apiEndpoint = `${environment.apiEndpoint}workorders/`;

  constructor(private http: HttpClient) {
  }

  /**
   * Return the list of work orders as observable
   *
   */
  public getList(params?: any) {
    if (params.description && !params.description.includes('%')) {
      params.description = `%${params.description}%`;
    }
    return this.http.get(`${this.apiEndpoint}`, {
      params,
    });
  }

}
