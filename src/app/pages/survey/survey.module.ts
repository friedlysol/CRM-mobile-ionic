import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SurveyPageRoutingModule } from './survey-routing.module';

import { SurveyListPage } from './survey-list/survey-list.page';
import { SurveyViewPage } from '@app/pages/survey/survey-view/survey-view.page';
import { SharedModule } from '@app/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SurveyPageRoutingModule,
    SharedModule,
  ],
  declarations: [SurveyListPage, SurveyViewPage]
})
export class SurveyPageModule {}
