import { Component } from '@angular/core';
import {Platform} from '@ionic/angular';
import {DataService} from '@app/services/data.service';
import {AuthService} from '@app/services/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
      private authService: AuthService,
      private platform: Platform,
      private dataService: DataService,
  ) {
    this.dataService.init();
  }
}
