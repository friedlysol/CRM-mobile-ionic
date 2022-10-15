import { Component, OnInit } from '@angular/core';
import { SurveyInterface, SurveyQuestionInterface, SurveyQuestionPagination, SurveyResultInterface } from '@app/interfaces/survey.interface';
import { ActivatedRoute } from '@angular/router';
import { SurveyDatabase } from '@app/services/database/survey.database';
import { ModalController } from '@ionic/angular';
import { CommentModalComponent } from './comment-modal/comment-modal.component';

@Component({
  selector: 'app-survey-view',
  templateUrl: './survey-view.page.html',
  styleUrls: ['./survey-view.page.scss'],
})
export class SurveyViewPage implements OnInit {
  public survey: SurveyInterface = null;
  public questions: SurveyQuestionInterface[] = [];
  public answers: SurveyResultInterface[] = [];
  public pagination: SurveyQuestionPagination = {
    currentPage: 1,
    totalPages: 1,
    totalRows: 0
  };

  private objectUuid: string;
  private surveyUuid: string;

  constructor(
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private surveyDatabase: SurveyDatabase,
  ) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      this.objectUuid = params.get('objectUuid');
      this.surveyUuid = params.get('surveyUuid');

      this.survey = await this.surveyDatabase.getByUuid(this.surveyUuid);

      await this.getSurveyQuestions();
      this.initResults();
    });
  }

  getSurveyQuestions(page = 1, groupTypeId = null) {
    return this.surveyDatabase.getQuestionsForSurveyUuid(this.surveyUuid, this.objectUuid, groupTypeId, page)
      .then(result => {
        this.questions = result.questions;
        this.pagination = result.pagination;


        console.log('questions', this.questions, this.pagination);
      });
  }

  async initResults(){
    for(const question of this.questions){
      let answer = await this.surveyDatabase.getResultBySurveyAndQuestion(this.survey.id, question.id);
      if(!answer){
        await this.surveyDatabase.createResult(this.survey.uuid, this.survey.id, question.id);
        answer = await this.surveyDatabase.getResultBySurveyAndQuestion(this.survey.id, question.id);
      }
      this.answers.push(answer);
    }
  }

  async onYesOptionClick(question){
    const answer = this.getAnswer(question);
    answer.answer = 'yes';
    if(question.type === 'option_with_comment_for_yes'){
      answer.comment = await this.openCommentModal(answer.comment);
    }
    this.updateAnswer(answer);
  }

  async onNoOptionClick(question){
    const answer = this.getAnswer(question);
    answer.answer = 'no';
    if(question.type === 'option_with_comment_for_no'){
      answer.comment = await this.openCommentModal(answer.comment);
    }
    this.updateAnswer(answer);
  }

  onInputBlur(event, question){
    const answer = this.getAnswer(question);
    answer.answer = event.target.value;
    this.updateAnswer(answer);
  }

  updateAnswer(answer: SurveyResultInterface){
    this.surveyDatabase.updateResult(answer);
  }

  getAnswer(question){
    return this.answers.find(e => e.survey_question_id === question.id);
  }

  async openCommentModal(comment: string){
    const modal = await this.modalCtrl.create({
      component: CommentModalComponent,
      componentProps: {
        comment,
      }
    });
    modal.present();
    return modal.onDidDismiss().then(e => e.role === 'submit'? e.data: comment);
  }
}
