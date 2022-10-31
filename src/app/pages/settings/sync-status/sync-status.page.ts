import { Component, OnDestroy, OnInit } from '@angular/core';
import { SyncStatusInterface } from '@app/interfaces/sync-status.interface';
import { EventService } from '@app/services/event.service';
import { SyncService } from '@app/services/sync.service';
import { WorkOrderService } from '@app/services/workorder.service';
import { environment } from '@env/environment';
import { Subscription } from 'rxjs';
import { DatabaseService } from '@app/services/database.service';
import { SyncInterface } from '@app/interfaces/sync.interface';

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
    private databaseService: DatabaseService,
    private workOrderService: WorkOrderService,
    private syncService: SyncService,
  ) {
  }

  async ngOnInit() {
    for (const key of Object.keys(environment.tableToServiceMap)) {
      const synStatus: SyncStatusInterface = {
        table: key,
        total: await this.getTotal(key),
      };

      this.tableData.push(synStatus);
    }

    const endSync = EventService.endSync
      .subscribe((status: boolean) => {
        if (status) {
          setTimeout(() => EventService.syncInProgress.next(false), 200);
        }
      });

    this.subscriptions.add(endSync);
  }

  onSync(tableName: string) {
    const serviceName = this.getServiceNameByTableName(tableName);

    if (serviceName) {
      EventService.syncInProgress.next(true);

      this[serviceName].sync().then((res) => {
        EventService.endSync.next(res);
      });
    }
  }

  onClearHash(tableName: string) {
    const serviceName = this.getServiceNameByTableName(tableName);

    if (serviceName) {
      this[serviceName].clearHash()
    }
  }

  onSyncAll() {
    this.syncService.sync();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private async getTotal(tableName: string) {
    const unSynchronized = await this.databaseService.getUnSynchronized(tableName);

    return unSynchronized.length;
  }

  private getServiceNameByTableName(tableName: string) {
    if (environment?.tableToServiceMap && environment?.tableToServiceMap.hasOwnProperty(tableName)) {
      let serviceName = environment.tableToServiceMap[tableName];

      return serviceName.charAt(0).toLowerCase() + serviceName.slice(1);
    }

    return null;
  }
}
