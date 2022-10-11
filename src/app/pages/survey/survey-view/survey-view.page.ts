import { Component, OnInit } from '@angular/core';
import { SurveyInterface, SurveyQuestionInterface, SurveyQuestionPagination } from '@app/interfaces/survey.interface';
import { ActivatedRoute } from '@angular/router';
import { SurveyDatabase } from '@app/services/database/survey.database';

@Component({
  selector: 'app-survey-view',
  templateUrl: './survey-view.page.html',
  styleUrls: ['./survey-view.page.scss'],
})
export class SurveyViewPage implements OnInit {
  public survey: SurveyInterface = null;
  public questions: SurveyQuestionInterface[] = [];
  public pagination: SurveyQuestionPagination = {
    currentPage: 1,
    totalPages: 1,
    totalRows: 0
  };

  private objectUuid: string;
  private surveyUuid: string;

  constructor(
    private route: ActivatedRoute,
    private surveyDatabase: SurveyDatabase
  ) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      this.objectUuid = params.get('objectUuid');
      this.surveyUuid = params.get('surveyUuid');

      this.survey = await this.surveyDatabase.getByUuid(this.surveyUuid);

      this.getSurveyQuestions();
    });
  }

  getSurveyQuestions(page = 1, groupTypeId = null) {
    this.surveyDatabase.getQuestionsForSurveyUuid(this.surveyUuid, this.objectUuid, groupTypeId, page)
      .then(result => {
        this.questions = result.questions;
        this.pagination = result.pagination;


        console.log('questions', this.questions, this.pagination);
      });
  }
}
