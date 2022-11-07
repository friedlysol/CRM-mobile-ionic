import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-error-text',
  templateUrl: './error-text.component.html',
  styleUrls: ['./error-text.component.scss'],
})
export class ErrorTextComponent implements OnInit {
  @Input() field: AbstractControl;
  @Input() message?: string = 'This field is required';

  constructor() {
  }

  ngOnInit() {
  }

}
