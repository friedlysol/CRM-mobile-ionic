import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-yes-or-no-options',
  templateUrl: './yes-or-no-options.component.html',
  styleUrls: ['./yes-or-no-options.component.scss'],
})
export class YesOrNoOptionsComponent implements OnInit {
  @Input() selected?: boolean = null;
  @Output() selectedChange = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {}

  onYesClick(){
    this.selectedChange.emit(true);
  }

  onNoClick(){
    this.selectedChange.emit(false);
  }

}
