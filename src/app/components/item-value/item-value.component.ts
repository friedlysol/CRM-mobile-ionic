import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-item-value',
  templateUrl: './item-value.component.html',
  styleUrls: ['./item-value.component.scss'],
})
export class ItemValueComponent implements OnInit {
  @Input() label: string;
  @Input() value: any;
  @Input() note?: any;

  constructor() {
  }

  ngOnInit() {
  }

}
