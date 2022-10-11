import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SyncInterface } from '@app/interfaces/sync.interface';
import { EventService } from '@app/services/event.service';
import { DatabaseService } from '@app/services/database.service';
import { UtilsService } from '@app/services/utils.service';
import * as moment from 'moment';
import { AddressService } from '@app/services/address.service';
import { AddressDatabase } from '@app/services/database/address.database';
import { SurveyDatabase } from '@app/services/database/survey.database';
import { SurveyApi } from '@app/providers/api/survey-api';
import { ResponseSurveyApiInterface } from '@app/providers/api/interfaces/response-survey-api.interface';
import { WorkOrderDatabase } from '@app/services/database/workorder.database';

@Injectable({
  providedIn: 'root'
})
export class SurveyService implements SyncInterface {
  syncTitle = 'surveys';

  constructor(
    private addressDatabase: AddressDatabase,
    private addressService: AddressService,
    private databaseService: DatabaseService,
    private http: HttpClient,
    private utilsService: UtilsService,
    private surveyApi: SurveyApi,
    private surveyDatabase: SurveyDatabase,
    private workOrderDatabase: WorkOrderDatabase,
  ) {
  }

  async sync(): Promise<boolean> {
    const syncData = {
      answers: await this.surveyDatabase.getUnsynchronizedAnswers(),
      work_order_ids: await this.workOrderDatabase.getAllWorkOrderIds()
    };

    return this.surveyApi.sync(syncData)
      .toPromise()
      .then(async (res: ResponseSurveyApiInterface) => {
        await this.syncStatus(res);

        await this.syncSurveys(res);

        await this.syncQuestions(res);

        await this.syncAnswers(res);

        return true;
      });
  }

  private async syncStatus(res: ResponseSurveyApiInterface) {
    if (res?.response?.syncs?.length) {
      const queue = [];
      res.response.syncs.forEach(sync => {
        if (sync?.object_uuid && sync?.object_id) {
          queue.push(this.surveyDatabase.getSqlForUpdateSyncStatus(sync));
        }
      });

      return this.databaseService.bulkQueries(queue);
    }

    return Promise.resolve({});
  }

  private async syncSurveys(res: ResponseSurveyApiInterface) {
    if (res?.response?.surveys?.length) {
      EventService.syncDetails.next({
        start: moment().toISOString(),
        title: this.syncTitle,
        total: res.response.surveys.length,
        done: 0
      });

      // get survey ids from api response
      const surveyInstanceIds = res.response.surveys.map(survey => survey.survey_instance_id);

      // get existing work orders map from app db
      const existingSurveysHashMap = await this.surveyDatabase.getExistingSurveysAsMap(surveyInstanceIds);

      const queue = [];

      res.response.surveys.forEach(survey => {
        const surveyInstanceId = Number(survey.survey_instance_id);

        let query = null;

        const numberOfQuestions = res.response.number_of_questions || {};

        if (existingSurveysHashMap.hasOwnProperty(surveyInstanceId)) {
          const existingSurvey = existingSurveysHashMap[surveyInstanceId];

          if (survey.hash !== existingSurvey.hash) {
            query = this.surveyDatabase.getSqlForUpdateSurveyFromApiData(
              survey, {uuid: existingSurvey.uuid}, numberOfQuestions
            );
          }
        } else {
          query = this.surveyDatabase.getSqlForCreateSurveyFromApiData(survey, numberOfQuestions);
        }

        if (query) {
          queue.push(query);
        }
      });

      return this.databaseService.bulkQueries(queue);
    }

    return Promise.resolve({});
  }

  private async syncQuestions(res: ResponseSurveyApiInterface) {
    if (res?.response?.questions?.length) {


      // get survey question ids from api response
      const surveyQuestionIds = res.response.questions.map(question => question.survey_question_id);

      // get existing surveys map from app db
      const existingQuestionsHashMap = await this.surveyDatabase.getExistingQuestionsAsMap(surveyQuestionIds);

      const queue = [];

      res.response.questions.forEach(question => {
        const surveyQuestionId = Number(question.survey_question_id);

        let query = null;

        if (existingQuestionsHashMap.hasOwnProperty(surveyQuestionId)) {
          const existingQuestion = existingQuestionsHashMap[surveyQuestionId];

          if (question.hash !== existingQuestion.hash) {
            query = this.surveyDatabase.getSqlForUpdateQuestionFromApiData(
              question, {uuid: existingQuestion.uuid}
            );
          }
        } else {
          query = this.surveyDatabase.getSqlForCreateQuestionFromApiData(question);
        }

        if (query) {
          queue.push(query);
        }
      });

      return this.databaseService.bulkQueries(queue);
    }

    return Promise.resolve({});
  }

  private async syncAnswers(res: ResponseSurveyApiInterface) {
    if (res?.response?.answers?.length) {
      // get survey answer ids from api response
      const surveyAnswerIds = res.response.answers.map(answer => answer.survey_result_id);

      // get existing surveys map from app db
      const existingAnswersHashMap = await this.surveyDatabase.getExistingAnswersAsMap(surveyAnswerIds);

      // get survey ids from api response
      const surveyInstanceIds = res.response.answers.map(answer => answer.survey_instance_id);

      // get existing work orders map from app db
      const existingSurveysHashMap = await this.surveyDatabase.getExistingSurveysAsMap(surveyInstanceIds);

      const queue = [];

      res.response.answers.forEach(answer => {
        const surveyAnswerId = Number(answer.survey_result_id);

        let query = null;

        if (existingAnswersHashMap.hasOwnProperty(surveyAnswerId)) {
          const existingAnswer = existingAnswersHashMap[surveyAnswerId];

          if (answer.hash !== existingAnswer.hash) {
            query = this.surveyDatabase.getSqlForUpdateAnswerFromApiData(
              answer, {uuid: existingAnswer.uuid}, existingSurveysHashMap
            );
          }
        } else {
          query = this.surveyDatabase.getSqlForCreateAnswerFromApiData(answer, existingSurveysHashMap);
        }

        if (query) {
          queue.push(query);
        }
      });

      return this.databaseService.bulkQueries(queue);
    }

    return Promise.resolve({});
  }
}
