import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SurveyListPage } from './survey-list/survey-list.page';
import { SurveyViewPage } from '@app/pages/survey/survey-view/survey-view.page';

const routes: Routes = [
  {
    path: 'list/:workOrderUuid',
    component: SurveyListPage
  },
  {
    path: 'view/:surveyUuid/:workOrderUuid',
    component: SurveyViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveyPageRoutingModule {}
