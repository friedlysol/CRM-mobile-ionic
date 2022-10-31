import { Component, OnInit } from '@angular/core';
import { TypeInterface } from '@app/interfaces/type.interface';

@Component({
  selector: 'app-incidents-list',
  templateUrl: './incidents-list.page.html',
  styleUrls: ['./incidents-list.page.scss'],
})
export class IncidentsListPage implements OnInit {
  statuses: TypeInterface[] = [
    {
      id: 0,
      type: '',
      type_key: 'incomplete',
      type_value: 'Incomplete',
      type_order: 0,
      type_color: ''
    },
    {
      id: 1,
      type: '',
      type_key: 'complete',
      type_value: 'Complete',
      type_order: 0,
      type_color: ''
    }
  ];

  constructor() { }

  ngOnInit() {
  }

  onStatusChange(event){
    console.log(event)
  }
}
