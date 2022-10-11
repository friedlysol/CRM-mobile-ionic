import { Injectable } from '@angular/core';
import { Api } from '@app/providers';
import { Observable } from 'rxjs';
import { ResponseSurveyApiInterface } from '@app/providers/api/interfaces/response-survey-api.interface';

@Injectable({
  providedIn: 'root'
})
export class SurveyApi extends Api {
  sync(params: any): Observable<ResponseSurveyApiInterface> {
    return this.http.post<ResponseSurveyApiInterface>(`${this.apiEndpoint}mobile/v2/surveys/sync`, params);
  }
}
