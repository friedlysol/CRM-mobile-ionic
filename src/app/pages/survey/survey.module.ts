import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule, IonNav } from '@ionic/angular';

import { SurveyPageRoutingModule } from './survey-routing.module';

import { SurveyListPage } from './survey-list/survey-list.page';
import { SurveyViewPage } from '@app/pages/survey/survey-view/survey-view.page';
import { SharedModule } from '@app/shared.module';
import { CommentModalComponent } from './survey-view/comment-modal/comment-modal.component';
import { SubquestionsModalComponent } from './survey-view/subquestions-modal/subquestions-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SurveyPageRoutingModule,
    SharedModule,
  ],
  declarations: [
    SurveyListPage,
    SurveyViewPage,
    CommentModalComponent,
    SubquestionsModalComponent,
  ],
  providers: [IonNav]
})
export class SurveyPageModule {}
