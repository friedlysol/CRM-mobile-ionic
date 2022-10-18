import { Component, OnInit } from '@angular/core';
import { SurveyInterface, SurveyQuestionInterface, SurveyQuestionPagination, SurveyResultInterface } from '@app/interfaces/survey.interface';
import { ActivatedRoute } from '@angular/router';
import { SurveyDatabase } from '@app/services/database/survey.database';
import { ModalController } from '@ionic/angular';
import { CommentModalComponent } from './comment-modal/comment-modal.component';
import { FileInterface } from '@app/interfaces/file.interface';
import { TypeInterface } from '@app/interfaces/type.interface';
import { TypeService } from '@app/services/type.service';
import { SubquestionsModalComponent } from './subquestions-modal/subquestions-modal.component';

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
  public groups: TypeInterface[] = [];

  private objectUuid: string;
  private surveyUuid: string;

  constructor(
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private surveyDatabase: SurveyDatabase,
    private typeService: TypeService,
  ) {
  }

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      this.objectUuid = params.get('objectUuid');
      this.surveyUuid = params.get('surveyUuid');

      this.survey = await this.surveyDatabase.getByUuid(this.surveyUuid);

      await this.getSurveyQuestions();
    });
    this.groups = await this.typeService.getByType('survey_groups');
  }

  getSurveyQuestions(page = 1, groupTypeId = null) {
    return this.surveyDatabase.getQuestionsForSurveyUuid(this.surveyUuid, this.objectUuid, groupTypeId, page)
      .then(result => {
        this.questions = result.questions;
        this.pagination = result.pagination;
        this.initResults();

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
      question.answer_uuid = answer.uuid;
      question.answer = answer.answer;
    }
  }

  async onOptionClick(question: SurveyQuestionInterface, type: 'comment' | 'questions', option: 'yes' | 'no'){
    const answer = this.getAnswer(question);
    answer.answer = option;
    question.answer = option;
    if(question.type === `option_with_${type}_for_${option}`){
      answer.comment = type === 'comment'?
        await this.openCommentModal(answer.comment):
        await this.openSubquestionsModal(JSON.parse(answer.comment) || question.options);
      question.comment = answer.comment;
      if(!answer.comment){
        answer.answer = null;
        question.answer = answer.answer;
      }
    }else{
      answer.comment = null;
      question.comment = answer.comment;
    }
    this.updateAnswer(answer);
  }

  onInputChange(event, question: SurveyQuestionInterface){
    const answer = this.getAnswer(question);
    answer.answer = event.target.value;
    this.updateAnswer(answer);
  }

  onFileSave(question: SurveyQuestionInterface){
    const answer = this.getAnswer(question);
    answer.answer = '-';
    this.updateAnswer(answer);
  }

  onGroupChange(select, page = 1){
    const value: TypeInterface | null = select.value;
    if(value){
      this.getSurveyQuestions(page, value.id);
    }else{
      this.getSurveyQuestions(page);
    }
  }

  updateAnswer(answer: SurveyResultInterface){
    this.surveyDatabase.updateResult(answer);
  }

  getAnswer(question){
    return this.answers.find(e => e.uuid === question.answer_uuid);
  }

  async openCommentModal(comment: string){
    const modal = await this.modalCtrl.create({
      component: CommentModalComponent,
      cssClass: 'popup',
      componentProps: {
        comment,
      }
    });
    modal.present();
    return modal.onDidDismiss().then(e => e.role === 'submit'? e.data: comment);
  }

  async openSubquestionsModal(options){
    const modal = await this.modalCtrl.create({
      component: SubquestionsModalComponent,
      componentProps: {
        subquestions: options.subquestions,
      }
    });
    modal.present();
    return modal.onDidDismiss().then(e => e.role === 'submit'? JSON.stringify({subquestions: e.data}): null);
  }

  jsonParse(str: string){
    return JSON.parse(str);
  }
}
