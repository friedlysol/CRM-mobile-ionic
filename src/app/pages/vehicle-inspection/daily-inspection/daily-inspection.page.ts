import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-daily-inspection',
  templateUrl: './daily-inspection.page.html',
  styleUrls: ['./daily-inspection.page.scss'],
})
export class DailyInspectionPage implements OnInit {
  withoutPreview: 0 | 1;
  redirectTo: string;

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      this.withoutPreview = params.get('withoutPreview') === '0'? 0: 1;
      this.redirectTo = params.get('redirectTo');
    });
  }

}
