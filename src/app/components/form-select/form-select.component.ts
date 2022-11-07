import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-select',
  templateUrl: './form-select.component.html',
  styleUrls: ['./form-select.component.scss'],
})
export class FormSelectComponent implements OnInit {
  @Input() controlName: string;
  @Input() form: FormGroup;
  @Input() label: string;
  @Input() options: any = {};
  @Input() required: boolean = false;

  @Input() labelKey?: string = 'type_value';
  @Input() valueKey?: string = 'id';
  @Input() order?: string = 'type_value';

  constructor() {
  }

  ngOnInit() {
  }

}
