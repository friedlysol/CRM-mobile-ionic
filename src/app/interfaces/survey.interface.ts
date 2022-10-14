export interface SurveyInterface {
  uuid?: string;
  id: number;
  survey_id: number;
  type_id: number;
  name: string;
  table_name: string;
  record_id: number;
  number_of_questions: number;
  require_every_day: number;
  scheduled_date: string;
  address_name: string;
  status_type_id: number;
  technician: string;
  comment: string;
  hash: string;
  sync?: number;
  created_at?: string;
  updated_at?: string;

  //extra fields
  total?: number;
  answered?: number;
  total_photos?: number;
  photos?: number;
}

export interface SurveyQuestionInterface {
  uuid?: string;
  id: number;
  survey_id: number;
  group_type_id: number;
  title: string;
  help_text: string;
  type: string;
  options: string;
  order_by: number;
  required: number;
  photo: string;
  active: number;
  hash: string;
  sync?: number;
  created_at?: string;
  updated_at?: string;

  //extra fields
  answer_uuid?: string;
  answer?: string;
  comment?: string;
  group_name?: string;
}

export interface SurveyResultInterface {
  uuid?: string;
  id: number;
  survey_instance_uuid?: string;
  survey_instance_id: number;
  survey_question_id: number;
  answer: string;
  comment: string;
  object_type?: string;
  object_uuid?: string;
  object_id?: number;
  sync?: number;
  hash: string;
  created_at?: string;
  updated_at?: string;

  //extra fields
  table_name?: string;
}

export interface SurveyNumberOfQuestionsInterface {
  survey_id: number;
  number_of_questions: number;
  total_questions: number;
}

export interface SurveyQuestionPaginationInterface {
  questions: SurveyQuestionInterface[];
  pagination: SurveyQuestionPagination;
}

export interface SurveyQuestionPagination {
  currentPage: number;
  totalPages: number;
  totalRows: number;
}
