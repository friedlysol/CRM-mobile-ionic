import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

/**
 * Api is a generic REST Api handler. Set your API url first.
 */
@Injectable()
export class Api {
  protected apiEndpoint = `${environment.apiEndpoint}`;

  constructor(public http: HttpClient) {
    //ToDo: overwrite apiEndpoint with settings from the base
  }
}
