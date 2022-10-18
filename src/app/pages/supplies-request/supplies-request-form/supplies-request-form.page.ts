import { Component, OnInit } from '@angular/core';
import { TypeInterface } from '@app/interfaces/type.interface';
import { TypeService } from '@app/services/type.service';

@Component({
  selector: 'app-supplies-request-form',
  templateUrl: './supplies-request-form.page.html',
  styleUrls: ['./supplies-request-form.page.scss'],
})
export class SuppliesRequestFormPage implements OnInit {
  jobTypes: TypeInterface[] = [];

  constructor(
    private typeService: TypeService,
  ) { }

  async ngOnInit() {
    this.jobTypes = await this.typeService.getByType('supplies_request_job_type');
    console.log(this.jobTypes)
  }

}
