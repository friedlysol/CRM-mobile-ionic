import { Component, OnInit } from '@angular/core';
import { WorkOrderInterface } from '@app/interfaces/work-order.interface';
import { WorkOrderDatabase } from '@app/services/database/workorder.database';
import { WorkOrderService } from '@app/services/workorder.service';
import { environment } from '@env/environment';
import * as moment from 'moment';


@Component({
  selector: 'app-calendar-views-list',
  templateUrl: './calendar-views-list.page.html',
  styleUrls: ['./calendar-views-list.page.scss'],
})
export class CalendarViewsListPage implements OnInit {
  weekDays: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  startDate: string;
  endDate: string;
  days: string[][] = [];
  workOrders: Map<string, {current: number; canceled: number; completed: number}> = new Map();

  constructor(
    private workOrderDatabase: WorkOrderDatabase,
  ) { }

  ngOnInit() {
    if(environment.firstDayOfWeek === 1){
      this.weekDays.unshift(this.weekDays.pop());
    }

    this.startDate = this.formatDateToString(moment().startOf('month').startOf('week'));
    this.endDate = this.formatDateToString(moment().endOf('month').endOf('week'));
    this.generateDays();
    this.loadList();
  }

  loadList() {
    this.workOrders= new Map();
    this.workOrderDatabase
      .getAllForDateRange(this.startDate, this.endDate)
      .then((res: any) => {
        res.forEach((wo: WorkOrderInterface) => {
          const date = this.formatDateToString(moment(wo.scheduled_date));

          if(!this.workOrders.has(date)){
            this.workOrders.set(date, {canceled: 0, completed: 0, current: 0});
          }

          if(wo.status === 'canceled'){
            this.workOrders.get(date).canceled++;
          }else if(wo.status === 'completed'){
            this.workOrders.get(date).completed++;
          }else{
            this.workOrders.get(date).current++;
          }
        });
      });

  }

  generateDays(){
    this.days = [];
    let current = moment(this.startDate);
    while(current < moment(this.endDate)){
      const week = [];
      for(let i = 0; i < 7; i++){
        week.push(this.formatDateToString(current));
        current = current.add(1, 'days');
      }
      this.days.push(week);
    }
  }

  isCurrentMonth(day: string){
    const start = moment(this.startDate).add(15, 'days').startOf('month');
    const end = moment(this.startDate).add(15, 'days').endOf('month');

    return moment(day) >= start && moment(day) <= end;
  }

  nextMonth(){
    this.startDate = this.formatDateToString(moment(this.endDate).add(1, 'week').startOf('month').startOf('week'));
    this.endDate = this.formatDateToString(moment(this.endDate).add(1, 'week').endOf('month').endOf('week'));
    this.generateDays();
    this.loadList();
  }

  prevMonth(){
    this.endDate = this.formatDateToString(moment(this.startDate).add(-1, 'week').endOf('month').endOf('week'));
    this.startDate = this.formatDateToString(moment(this.startDate).add(-1, 'week').startOf('month').startOf('week'));
    this.generateDays();
    this.loadList();
  }

  private formatDateToString(date: moment.Moment){
    return date.format('YYYY-MM-DD').toString();
  }
}
