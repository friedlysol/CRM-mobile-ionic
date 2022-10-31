import { Component, OnInit } from '@angular/core';
import { SurveyInterface } from '@app/interfaces/survey.interface';
import { WorkOrderInterface } from '@app/interfaces/work-order.interface';
import { WorkOrderDatabase } from '@app/services/database/workorder.database';
import { ActivatedRoute } from '@angular/router';
import { SurveyDatabase } from '@app/services/database/survey.database';

@Component({
  selector: 'app-survey-list',
  templateUrl: './survey-list.page.html',
  styleUrls: ['./survey-list.page.scss'],
})
export class SurveyListPage implements OnInit {
  public surveys: SurveyInterface[] = [];
  public workOrder: WorkOrderInterface = null;

  public workOrderUuid: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private surveyDatabase: SurveyDatabase,
    private workOrderDatabase: WorkOrderDatabase
  ) {
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(async params => {
      this.workOrderUuid = params.get('workOrderUuid');

      this.workOrder = await this.workOrderDatabase.getByUuid(this.workOrderUuid);
      this.surveys = await this.surveyDatabase.getAllSurveysForWorkOrderId(this.workOrder.work_order_id);
    });
  }
}
