import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkOrderInterface } from '@app/interfaces/work-order.interface';
import { WorkOrderDatabase } from '@app/services/database/workorder.database';
import { UtilsService } from '@app/services/utils.service';

@Component({
  selector: 'app-calendar-views-view',
  templateUrl: './calendar-views-view.page.html',
  styleUrls: ['./calendar-views-view.page.scss'],
})
export class CalendarViewsViewPage implements OnInit {
  date: string;
  workOrders: {current: WorkOrderInterface[]; canceled: WorkOrderInterface[]; completed: WorkOrderInterface[]} = {
    current: [],
    canceled: [],
    completed: [],
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private workOrderDatabase: WorkOrderDatabase,
    public utilsService: UtilsService,
  ) { }

  get allWorkOrders(){
    return [...this.workOrders.current, ...this.workOrders.completed, ...this.workOrders.canceled];
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.date = params.get('date');
      this.loadList();
    });
  }

  loadList() {
    this.workOrderDatabase
      .getAllForDateRange(this.date, this.date)
      .then((res: any) => {
        console.log(res)
        res.forEach((wo: WorkOrderInterface) => {
          if(wo.status === 'canceled'){
            this.workOrders.canceled.push(wo);;
          }else if(wo.status === 'completed'){
            this.workOrders.completed.push(wo);
          }else{
            this.workOrders.current.push(wo);
          }

        });
      });
  }
}
