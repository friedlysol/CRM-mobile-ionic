import { Component, OnInit } from '@angular/core';
import { SyncService } from '@app/services/sync.service';
import { Toast } from '@ionic-native/toast/ngx';

@Component({
  selector: 'app-settings-list',
  templateUrl: './settings-list.page.html',
  styleUrls: ['./settings-list.page.scss'],
})
export class SettingsListPage implements OnInit {

  constructor(private syncService: SyncService, private toast: Toast) {
  }

  ngOnInit() {
  }

  exportDatabase() {
    this.syncService.exportDatabase()
      .then(file => {
        let message = `The database cannot be sent, no internet connection`;

        if (file) {
          message = `The database has been added to the queue, it will be sent as soon as possible.`;
        }

        this.toast.show(message, '3000', 'bottom').subscribe();
      });
  }
}
