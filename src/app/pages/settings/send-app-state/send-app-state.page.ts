import { Component, OnInit } from '@angular/core';
import { SyncService } from '@app/services/sync.service';

@Component({
  selector: 'app-send-app-state',
  templateUrl: './send-app-state.page.html',
  styleUrls: ['./send-app-state.page.scss'],
})
export class SendAppStatePage implements OnInit {

  constructor(
    private syncService: SyncService,
  ) { }

  ngOnInit() {
  }

  onSendAppStateClick(){
    this.syncService.exportDatabase();
  }

}
