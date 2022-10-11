import { SyncApiInterface } from '@app/providers/api/interfaces/sync-api.interface';

export interface ResponseSurveyApiInterface {
  response: {
    syncs: SyncApiInterface[];
    answers: SurveyAnswerApiInterface[];
    questions: SurveyQuestionApiInterface[];
    surveys: SurveyApiInterface[];
    number_of_questions: Array<number>;
  };
}

export interface SurveyApiInterface {
  survey_instance_id: number;
  survey_id: number;
  name: string;
  type_id: number;
  table_name: string;
  record_id: number;
  scheduled_date: string;
  address_name: string;
  status_type_id: number;
  require_every_day?: number;
  comment?: string;
  technician?: string;
  hash: string;
}

export interface SurveyQuestionApiInterface {
  survey_question_id: number;
  survey_id: number;
  title: string;
  help_text: string;
  type: string;
  options: string;
  order_by: number;
  active: number;
  photo: string;
  required: number;
  group_type_id: number;
  hash: string;
}

export interface SurveyAnswerApiInterface {
  survey_result_id: number;
  survey_instance_id: number;
  survey_question_id: number;
  answer: string;
  answered_person_id: number;
  table_name: string;
  record_id: number;
  comment: string;
  hash: string;
  created_at: string;
  updated_at: string;
}


