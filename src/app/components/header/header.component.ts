import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { EventService } from '@app/services/event.service';
import { IonRouterOutlet, MenuController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() title: string = null;
  @Input() showSync: boolean = true;

  public syncInProgress = false;

  private subscriptions = new Subscription();

  constructor(private menuController: MenuController, private routerOutlet: IonRouterOutlet) {
  }

  ngOnInit() {
    this.subscriptions.add(EventService.syncInProgress.subscribe(status => {
      this.syncInProgress = status;

      console.log('this.syncInProgress', this.syncInProgress);
    }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  goBack() {
    this.routerOutlet.pop();
  }

  toggleMenu() {
    this.menuController.toggle();
  }

  syncAll() {
    EventService.startSync.next(true);
  }
}
