import { Component, OnDestroy, OnInit } from '@angular/core';
import { SyncStatusInterface } from '@app/interfaces/sync-status.interface';
import { EventService } from '@app/services/event.service';
import { SettingsService } from '@app/services/settings.service';
import { SyncService } from '@app/services/sync.service';
import { TypeService } from '@app/services/type.service';
import { WorkOrderService } from '@app/services/workorder.service';
import { environment } from '@env/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sync-status',
  templateUrl: './sync-status.page.html',
  styleUrls: ['./sync-status.page.scss'],
})
export class SyncStatusPage implements OnInit, OnDestroy {
  tableData: SyncStatusInterface[] = [];
  syncInProgress$ = EventService.syncInProgress.asObservable();

  private subscriptions = new Subscription();

  constructor(
    private workOrderService: WorkOrderService,
    private syncService: SyncService,
  ) { }

  async ngOnInit() {
    for(const key of Object.keys(environment.tableToServiceMap)){
      const synStatus: SyncStatusInterface = {
        table: key,
        total: await this.getTotal(key),
      };
      this.tableData.push(synStatus);
    }

    const endSync = EventService.endSync
      .subscribe((status: boolean) => {
        if(status) {
          setTimeout(() => EventService.syncInProgress.next(false), 200);
        }
      });

    this.subscriptions.add(endSync);
  }

  onSync(tableName: string){
    switch(environment.tableToServiceMap[tableName]){
      case 'WorkOrderService':
        EventService.syncInProgress.next(true);
        this.workOrderService.sync().then((res) => {
          EventService.endSync.next(res);
        });
        break;
    }
  }

  onClearHash(tableName: string){
    switch(environment.tableToServiceMap[tableName]){
      case 'WorkOrderService':
        this.workOrderService.clearHash();
        break;
    }
  }

  onSyncAll(){
    this.syncService.sync();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private async getTotal(tableName: string){
    let total: number;
    switch(environment.tableToServiceMap[tableName]){
      case 'WorkOrderService':
        const unsynchronizedWorkOrders = await this.workOrderService.getUnsynchronizedWorkOrders();
        total = unsynchronizedWorkOrders.length;
        break;
      default:
        total = 0;
    }
    return total;
  }
}
