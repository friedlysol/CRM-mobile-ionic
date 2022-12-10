import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WorkOrderInterface } from '@app/interfaces/work-order.interface';
import { WorkOrderDatabase } from '@app/services/database/workorder.database';
import { UtilsService } from '@app/services/utils.service';
import { environment } from '@env/environment';
import * as moment from 'moment';


@Component({
  selector: 'app-calendar-views-list',
  templateUrl: './calendar-views-list.page.html',
  styleUrls: ['./calendar-views-list.page.scss'],
})
export class CalendarViewsListPage implements OnInit {
  @Input() selectedDate = '';
  @Output() selectedDateChange = new EventEmitter<string>();
  weekDays: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  startDate: string;
  endDate: string;
  days: string[][] = [];
  workOrders: Map<string, {current: WorkOrderInterface[]; canceled: WorkOrderInterface[]; completed: WorkOrderInterface[]}> = new Map();
  months = {
    prev: '',
    current: '',
    next: '',
  };

  constructor(
    private workOrderDatabase: WorkOrderDatabase,
    public utilsService: UtilsService,
  ) { }

  get allWorkOrders(){
    return [
      ...this.workOrders.get(this.selectedDate)?.current || [],
      ...this.workOrders.get(this.selectedDate)?.completed || [],
      ...this.workOrders.get(this.selectedDate)?.canceled || []
    ];
  }

  ngOnInit() {
    if(environment.firstDayOfWeek === 1){
      this.weekDays.unshift(this.weekDays.pop());
    }

    this.workOrderDatabase.getScheduledDateClosestToToday().then(r => this.setMonth(r?.scheduled_date));
  }

  changeSelectedDate(newDate: string){
    this.selectedDate = newDate;
    this.selectedDateChange.emit(this.selectedDate);
  }

  loadList() {
    this.workOrders= new Map();
    this.workOrderDatabase
      .getAllForDateRange(this.startDate, this.endDate)
      .then((res: any) => {
        res.forEach((wo: WorkOrderInterface) => {
          const date = this.formatDateToString(moment(wo.scheduled_date));

          if(!this.workOrders.has(date)){
            this.workOrders.set(date, {canceled: [], completed: [], current: []});
          }

          if(wo.status === 'canceled'){
            this.workOrders.get(date).canceled.push(wo);
          }else if(wo.status === 'completed'){
            this.workOrders.get(date).completed.push(wo);
          }else{
            this.workOrders.get(date).current.push(wo);
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

  setMonth(date: string){
    this.months.current = date || this.formatDateToString(moment());
    this.workOrderDatabase.getPreviousClosestScheduledDate(this.months.current).then(r => this.months.prev = r?.scheduled_date);
    this.workOrderDatabase.getNextClosestScheduledDate(this.months.current).then(r => this.months.next = r?.scheduled_date);
    this.endDate = this.formatDateToString(moment(this.months.current).endOf('month').endOf('week'));
    this.startDate = this.formatDateToString(moment(this.months.current).startOf('month').startOf('week'));
    this.generateDays();
    this.loadList();
  }

  private formatDateToString(date: moment.Moment){
    return date.format('YYYY-MM-DD').toString();
  }
}
