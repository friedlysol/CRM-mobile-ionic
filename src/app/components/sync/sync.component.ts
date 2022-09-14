import { Component, OnDestroy, OnInit } from '@angular/core';
import { SyncDetailsInterface } from '@app/interfaces/sync.details-interface';
import { Subscription } from 'rxjs';
import { EventService } from '@app/services/event.service';
import { SyncService } from '@app/services/sync.service';

@Component({
  selector: 'app-sync',
  templateUrl: './sync.component.html',
  styleUrls: ['./sync.component.scss'],
})
export class SyncComponent implements OnInit, OnDestroy {

  public syncInProgress = false;
  public sync: SyncDetailsInterface = {
    title: null,
    total: 0,
    done: 0,
    start: null
  };

  public pendingStatus = 0;

  public syncStats: Array<string> = [];

  private subscriptions = new Subscription();

  constructor(private syncService: SyncService) {

  }

  ngOnInit() {
    const startSync = EventService.startSync
      .subscribe((status: boolean) => {
        if(status && !this.syncInProgress) {
          EventService.syncInProgress.next(true);

          this.syncService.sync();
        }
      });

    const syncInProgress = EventService.syncInProgress
      .subscribe((syncStatus: boolean) => {
        this.syncInProgress = syncStatus;
      });

    const syncDetails = EventService.syncDetails
      .subscribe((sync: SyncDetailsInterface) => {
        this.sync = sync;
        this.pendingStatusCalc();

        console.log('SyncDetails', sync);
      });

    const syncDetailsDone = EventService.syncDetailsDone
      .subscribe((done: boolean) => {
        if(done) {
          this.sync.done += 1;
          this.pendingStatusCalc();
        }
      });

    const endSync = EventService.endSync
      .subscribe((status: boolean) => {
        if(status) {
          setTimeout(() => EventService.syncInProgress.next(false), 200);
        }
      });

    this.subscriptions.add(startSync);
    this.subscriptions.add(syncInProgress);
    this.subscriptions.add(syncDetails);
    this.subscriptions.add(syncDetailsDone);
    this.subscriptions.add(endSync);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private pendingStatusCalc() {
    this.pendingStatus = Math.round((this.sync.done * 100) / this.sync.total);
  }
}
