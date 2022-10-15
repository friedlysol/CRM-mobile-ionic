import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';
import {
  SurveyInterface,
  SurveyQuestionInterface,
  SurveyQuestionPaginationInterface,
  SurveyResultInterface
} from '@app/interfaces/survey.interface';
import { SettingsService } from '@app/services/settings.service';
import { SyncApiInterface } from '@app/providers/api/interfaces/sync-api.interface';
import * as sqlBuilder from 'sql-bricks';
import { HashMapInterface } from '@app/interfaces/hash-map.interface';
import {
  SurveyAnswerApiInterface,
  SurveyApiInterface,
  SurveyQuestionApiInterface
} from '@app/providers/api/interfaces/response-survey-api.interface';

@Injectable({
  providedIn: 'root'
})
export class SurveyDatabase {
  constructor(private databaseService: DatabaseService, private settingsService: SettingsService) {
  }

  getById(id): Promise<SurveyInterface> {
    return this.databaseService.findOrNull(`select * from surveys where id = ?`, [
      id
    ]);
  };

  async getByUuid(uuid: string): Promise<SurveyInterface> {
    return this.databaseService.findOrNull(`select * from surveys where uuid = ?`, [
      uuid
    ]);
  };

  getAllSurveysForWorkOrderId(workOrderId): Promise<SurveyInterface[]> {
    return this.databaseService.findAsArray(`
        select 
          *,
          (select count(1) from survey_questions sq where sq.survey_id = s.survey_id and sq.active = 1) total,
          (select count(1)
            from survey_results sr
            where sr.survey_instance_id = s.id
              and sr.answer is not null
              and (s.require_every_day = 0 or (s.require_every_day = 1 and date(sr.created_at) = date()))
              and length(trim(sr.answer)) > 0
          ) answered,
          (select count(1)
            from survey_questions sq
            where sq.survey_id = s.survey_id
              and sq.active = 1
              and sq.photo = "required"
          ) total_photos,
          (select count(1) OVER ()
            from survey_results sr
            inner join files f on f.object_uuid = sr.uuid 
              and f.object_type = "survey_results" 
              and f.is_deleted = 0 and (
                s.require_every_day = 0 or (s.require_every_day = 1 and date(f.created_at) = date()))
            where sr.survey_instance_id = s.id
            group by f.object_uuid
          ) photos
        from surveys s
        where table_name = "work_order"
          and record_id = ?
      `,
      [
        workOrderId
      ]
    ).then(result => result.map(survey => {
      if (!survey.photos) {
        survey.photos = 0;
      }

      return survey;
    }));
  };

  getAllSurveysForObjectType(objectType, objectUuid): Promise<SurveyInterface[]> {
    return this.databaseService.findAsArray(`
      select *,
        (select count(1)
          from survey_questions sq
          where sq.survey_id = s.survey_id
            and sq.active = 1
        ) total,
        (select count(1)
          from survey_results sr
          where sr.object_uuid = ?
            and sr.survey_instance_id = s.id
              and sr.answer is not null
              and (s.require_every_day = 0 or (s.require_every_day = 1 and date(sr.created_at) = date()))
              and length(trim(sr.answer)) > 0
        ) answered
      from surveys s
      where table_name = ?
    `, [
      objectUuid,
      objectType
    ]);
  };

  checkNumberOfQuestionsForWorkOrderId(workOrderId): Promise<boolean> {
    return this.databaseService.findAsArray(`
      select 
        surveys.survey_id,
        surveys.number_of_questions,
        count(survey_questions.survey_question_id) as total_questions
      from surveys
      left join survey_questions ON surveys.survey_id = survey_questions.survey_id
      where table_name = 'work_order'
        and record_id = ?
      group by surveys.id
    `, [
      workOrderId
    ]).then(surveys => {
      let requiredSync = false;

      surveys.forEach(survey => {
        if (this.settingsService.check('survey.require_sync_only_if_missing_questions', 1)) {
          if (Number(survey.number_of_questions) > 0 && Number(survey.total_questions) === 0) {
            requiredSync = true;
          }
        } else {
          if (survey.total_questions < survey.number_of_questions) {
            requiredSync = true;
          }
        }
      });

      return requiredSync;
    });
  }

  getUnansweredSurveysForWorkOrderId(workOrderId) {
    return this.databaseService.findOrNull(`
      select (
        select count(1) from surveys s where s.record_id = wo.work_order_id) as total,
        (select count(1)
          from surveys s2
          where s2.record_id = wo.work_order_id
            and (
              select count(1)
              from survey_results sr
              where sr.survey_instance_id = s2.survey_instance_id
                and sr.answer is not null
                and length(trim(sr.answer)) > 0
                and (
                  s2.require_every_day = 0 or (
                    s2.require_every_day = 1 
                    and date(sr.created_at) = date()
                  )
                )
            ) >= (
              select count(1)
              from survey_questions sq
              where sq.survey_id = s2.survey_id
                and sq.required = 1
                and sq.active = 1
            )
        ) as answered,
        (select count(1)
          from surveys s
          inner join survey_questions sq
          where s.record_id = wo.work_order_id
            and sq.survey_id = s.survey_id
            and sq.active = 1
            and sq.photo = "required"
        ) as total_photos,
        (select count(1) OVER ()
          from surveys s
          inner join survey_results sr
          inner join files f on f.object_uuid = sr.uuid
            and f.object_type = "survey_results"
            and f.is_deleted = 0
            and (
              s.require_every_day = 0 or (
                s.require_every_day = 1 
                and date(f.created_at) = date()
              )
            )
          where s.record_id = wo.work_order_id
            and sr.survey_instance_id = s.id
          group by f.object_uuid
        ) as photos
      from work_orders wo
      where wo.work_order_id = ?
    `, [
      workOrderId
    ]);
  };

  async getUnsynchronizedAnswers(): Promise<SurveyResultInterface[]> {
    return this.databaseService.findAsArray(`
      select survey_results.*, surveys.table_name
      from survey_results
      left join surveys on survey_results.survey_instance_id = surveys.id
      where survey_results.survey_instance_id is not null and survey_results.sync = 0
    `);
  }

  getQuestionsForSurveyUuid(
    uuid,
    objectUuid,
    groupTypeId = null,
    pageNumber = 1,
    perPage = 10
  ): Promise<SurveyQuestionPaginationInterface> {
    const offset = (pageNumber - 1) * perPage;
    const params = [];

    let objectUuidConditions = '';
    let query = '';

    if (objectUuid) {
      objectUuidConditions = ` and sr.object_uuid = ?`;

      params.push(objectUuid);
    }

    query = `
      select sq.*, sr.uuid as answer_uuid, sr.answer, sr.comment, t.type_value as group_name
      from surveys s
      join survey_questions sq on s.survey_id = sq.survey_id and sq.active = 1
      left join types t on sq.group_type_id = t.id
      left join survey_results sr on sr.survey_question_id = sq.id
         and sr.survey_instance_id = s.id
         and (
            s.require_every_day = 0 or (s.require_every_day = 1 and date(sr.created_at) = date())
         )
         ${objectUuidConditions}
      where s.uuid = ?
        and sq.active = 1
    `;

    params.push(uuid);

    if (groupTypeId) {
      query += ` and group_type_id = ?`;

      params.push(groupTypeId);
    }

    query += ' order by sq.order_by*1 asc';

    const countQuery = 'select count(1) as totalRows from (' + query + ')';
    const queryWithLimit = query + ' limit ? offset ?';

    return this.databaseService.findOrNull(countQuery, params)
      .then(pagination => {
        pagination.currentPage = pageNumber;
        pagination.totalPages = Math.ceil(pagination.totalRows / perPage);

        params.push(perPage);
        params.push(offset);

        return this.databaseService.findAsArray(queryWithLimit, params)
          .then((questions: SurveyQuestionInterface[]) => {
            questions = questions.map(question => {
              if (question.options && question.options.length) {
                try {
                  question.options = JSON.parse(question.options);
                } catch (e) {
                  //
                }
              }

              return question;
            });

            return {
              questions,
              pagination
            };
          });
      }) as Promise<SurveyQuestionPaginationInterface>;
  };

  /**
   * Get survey map with uuid and hash
   *
   * @param surveyInstanceIds
   */
  async getExistingSurveysAsMap(surveyInstanceIds: number[]): Promise<Record<string, HashMapInterface>> {
    if (surveyInstanceIds && Array.isArray(surveyInstanceIds) && surveyInstanceIds.length) {
      const query = sqlBuilder
        .select('uuid', 'id', 'hash')
        .from('surveys')
        .where(sqlBuilder.in('id', ...surveyInstanceIds));

      return this.databaseService
        .findAsArray(query.toString(), query.toParams())
        .then(surveys => {
          const surveysMap = {};

          if (surveys && surveys.length) {
            surveys.forEach(survey => surveysMap[Number(survey.survey_instance_id)] = {
              hash: survey.hash,
              uuid: survey.uuid
            });
          }

          return surveysMap;
        });
    }

    return Promise.resolve({});
  }

  /**
   * Create sql query as string
   *
   * @param survey
   * @param numberOfQuestions
   */
  getSqlForCreateSurveyFromApiData(survey: SurveyApiInterface, numberOfQuestions?: Record<string, number>) {
    return sqlBuilder.insert('surveys', Object.assign({
      uuid: this.databaseService.getUuid(),
      created_at: this.databaseService.getTimeStamp(),
      updated_at: null,
      sync: 1
    }, this.surveyDatabaseObj(survey, numberOfQuestions)));
  }

  /**
   * Update sql query as string
   *
   * @param survey
   * @param condition
   * @param numberOfQuestions
   */
  getSqlForUpdateSurveyFromApiData(survey: SurveyApiInterface, condition = {}, numberOfQuestions?: Record<string, number>) {
    return sqlBuilder
      .update('surveys', Object.assign({
          updated_at: this.databaseService.getTimeStamp(),
          sync: 1
        }, this.surveyDatabaseObj(survey, numberOfQuestions))
      )
      .where(condition);
  }

  /**
   * Update sync status
   *
   * @param sync
   */
  getSqlForUpdateSyncStatus(sync: SyncApiInterface) {
    return sqlBuilder
      .update('survey_answers', {id: sync.object_id, sync: 1})
      .where({uuid: sync.object_uuid});
  }

  /**
   * Get question map with uuid and hash
   *
   * @param surveyQuestionIds
   */
  async getExistingQuestionsAsMap(surveyQuestionIds: number[]): Promise<Record<string, HashMapInterface>> {
    if (surveyQuestionIds && Array.isArray(surveyQuestionIds) && surveyQuestionIds.length) {
      const query = sqlBuilder
        .select('uuid', 'id', 'hash')
        .from('survey_questions')
        .where(sqlBuilder.in('id', ...surveyQuestionIds));

      return this.databaseService
        .findAsArray(query.toString(), query.toParams())
        .then(questions => {
          const questionsMap = {};

          if (questions && questions.length) {
            questions.forEach(question => questionsMap[Number(question.id)] = {
              hash: question.hash,
              uuid: question.uuid
            });
          }

          return questionsMap;
        });
    }

    return Promise.resolve({});
  }

  /**
   * Create sql query as string
   *
   * @param question
   * @param numberOfQuestions
   */
  getSqlForCreateQuestionFromApiData(question: SurveyQuestionApiInterface, numberOfQuestions?: Record<string, number>) {
    return sqlBuilder.insert('survey_questions', Object.assign({
      uuid: this.databaseService.getUuid(),
      created_at: this.databaseService.getTimeStamp(),
      updated_at: null,
      sync: 1
    }, this.questionDatabaseObj(question)));
  }

  /**
   * Update sql query as string
   *
   * @param question
   * @param condition
   */
  getSqlForUpdateQuestionFromApiData(question: SurveyQuestionApiInterface, condition = {}) {
    return sqlBuilder
      .update('survey_questions', Object.assign({
          updated_at: this.databaseService.getTimeStamp(),
          sync: 1
        }, this.questionDatabaseObj(question))
      )
      .where(condition);
  }

  /**
   * Get answer map with uuid and hash
   *
   * @param surveyAnswerIds
   */
  async getExistingAnswersAsMap(surveyAnswerIds: number[]): Promise<Record<string, HashMapInterface>> {
    if (surveyAnswerIds && Array.isArray(surveyAnswerIds) && surveyAnswerIds.length) {
      const query = sqlBuilder
        .select('uuid', 'id', 'hash')
        .from('survey_answers')
        .where(sqlBuilder.in('id', ...surveyAnswerIds));

      return this.databaseService
        .findAsArray(query.toString(), query.toParams())
        .then(answers => {
          const answersMap = {};

          if (answers && answers.length) {
            answers.forEach(answer => answersMap[Number(answer.id)] = {
              hash: answer.hash,
              uuid: answer.uuid
            });
          }

          return answersMap;
        });
    }

    return Promise.resolve({});
  }

  /**
   * Get result by survey and question
   *
   * @param surveyId
   * @param questionId
   */
  async getResultBySurveyAndQuestion(
    surveyId: number,
    questionId: number
    ): Promise<SurveyResultInterface> {
    const query = sqlBuilder
    .select()
    .from('survey_results')
    .where('survey_instance_id', surveyId)
    .where('survey_question_id', questionId);

    return this.databaseService.findOrNull(query.toString(), query.toParams());
  }

  /**
   * Create result in db
   *
   * @param surveyUuid
   * @param surveyId
   * @param questionId
   */
   async createResult(surveyUuid: string, surveyId: number, questionId: number): Promise<SurveyResultInterface | SurveyInterface> {
    const uuid = this.databaseService.getUuid();

    const query = sqlBuilder.insert('survey_results', Object.assign({
        uuid,
        survey_instance_uuid: surveyUuid,
        survey_instance_id: surveyId,
        survey_question_id: questionId,
        created_at: this.databaseService.getTimeStamp(),
        updated_at: null,
        comment: null,
        answer: null,
      })
    );

    return this.databaseService.query(query.toString(), query.toParams())
      .then(() => this.getByUuid(uuid));
  }

  /**
   * Update result
   *
   * @param result
   */
   updateResult(result: SurveyResultInterface) {
    const query = sqlBuilder.update('survey_results');
    Object.keys(result).forEach(field => {
      query.set(field, result[field]);
    });
    query.set('updated_at', this.databaseService.getTimeStamp());
    query.where('uuid', result.uuid);

    return this.databaseService.query(query.toString(), query.toParams());
  }

  /**
   * Create sql query as string
   *
   * @param answer
   * @param surveyInstanceHashMap
   */
  getSqlForCreateAnswerFromApiData(
    answer: SurveyAnswerApiInterface,
    surveyInstanceHashMap?: Record<string, HashMapInterface>
  ) {
    return sqlBuilder.insert('survey_results', Object.assign({
      uuid: this.databaseService.getUuid(),
      created_at: this.databaseService.getTimeStamp(),
      updated_at: null,
      sync: 1
    }, this.answerDatabaseObj(answer)));
  }

  /**
   * Update sql query as string
   *
   * @param answer
   * @param condition
   * @param surveyInstanceHashMap
   */
  getSqlForUpdateAnswerFromApiData(
    answer: SurveyAnswerApiInterface,
    condition = {},
    surveyInstanceHashMap?: Record<string, HashMapInterface>
  ) {
    return sqlBuilder
      .update('survey_results', Object.assign({
          updated_at: this.databaseService.getTimeStamp(),
          sync: 1
        }, this.answerDatabaseObj(answer))
      )
      .where(condition);
  }

  /**
   * @param survey
   * @param numberOfQuestions
   * @private
   */
  private surveyDatabaseObj(survey: SurveyApiInterface, numberOfQuestions?: Record<string, number>): SurveyInterface {
    const surveyNumberQuestion = numberOfQuestions.hasOwnProperty(survey.survey_instance_id)
      ? numberOfQuestions[survey.survey_instance_id]
      : null;

    return {
      id: survey.survey_instance_id,
      survey_id: survey.survey_id,
      type_id: survey.type_id,
      name: survey.name,
      table_name: survey.table_name,
      record_id: survey.record_id,
      number_of_questions: surveyNumberQuestion,
      require_every_day: survey.require_every_day || 0,
      scheduled_date: survey.scheduled_date,
      address_name: survey.address_name,
      status_type_id: survey.status_type_id,
      technician: survey.technician,
      comment: survey.comment,
      hash: survey.hash
    };
  }

  /**
   * @param question
   * @private
   */
  private questionDatabaseObj(question: SurveyQuestionApiInterface): SurveyQuestionInterface {
    return {
      id: question.survey_question_id,
      survey_id: question.survey_id,
      group_type_id: question.group_type_id,
      title: question.title,
      help_text: question.help_text,
      type: question.type,
      options: question.options,
      order_by: question.order_by,
      required: question.required,
      photo: question.photo,
      active: question.active,
      hash: question.hash,
    };
  }

  /**
   * @private
   * @param answer
   * @param surveyInstanceHashMap
   */
  private answerDatabaseObj(
    answer: SurveyAnswerApiInterface,
    surveyInstanceHashMap?: Record<string, HashMapInterface>
  ): SurveyResultInterface {
    const surveyInstanceUuid = surveyInstanceHashMap.hasOwnProperty(answer.survey_instance_id)
      ? surveyInstanceHashMap[answer.survey_instance_id].uuid
      : null;

    return {
      id: answer.survey_question_id,
      survey_instance_uuid: surveyInstanceUuid,
      survey_instance_id: answer.survey_instance_id,
      survey_question_id: answer.survey_question_id,
      answer: answer.answer,
      comment: answer.comment,
      object_type: answer.table_name,
      object_id: answer.record_id,
      hash: answer.hash,
    };
  }
}
