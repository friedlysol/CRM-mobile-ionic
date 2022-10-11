import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@app/services/auth.service';
import { AlertController } from '@ionic/angular';
import { WorkOrderService } from '@app/services/workorder.service';
import { EventService } from '@app/services/event.service';
import { TabInterface } from '@app/interfaces/tab.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkOrderInterface } from '@app/interfaces/work-order.interface';

import { environment } from '@env/environment';
import { AddressService } from '@app/services/address.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-work-order-list',
  templateUrl: './work-order-list.page.html',
  styleUrls: ['./work-order-list.page.scss'],
})
export class WorkOrderListPage implements OnInit, OnDestroy {
  isLoading = false;

  params: any = {
    query: '',
    short: false
  };

  tabs: TabInterface[] = [];

  workOrders: WorkOrderInterface[];

  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router,
    private workOrderService: WorkOrderService,
    public addressService: AddressService
  ) {
    this.setTabs();
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      if (params) {
        this.params = Object.assign({}, params);
      }

      if (this.params.hasOwnProperty('tab')) {
        this.setActiveTab(this.params.tab, false);
      }

      this.loadList();
    });

    this.subscriptions.add(EventService.endSync.subscribe(status => {
      if (status) {
        this.loadList();
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  sync() {
    EventService.startSync.next(true);
  }

  changePage(i: number) {
    //this.params.page = i;
    this.loadList();
  }

  loadList() {
    const activeTab = this.getActiveTabKey();

    this.isLoading = true;

    this.workOrderService
      .getWorkOrdersByTab(activeTab, this.params.query)
      .then((workOrders: WorkOrderInterface[]) => {
        this.isLoading = false;

        this.workOrders = workOrders;
      });

    this.workOrderService.getTotalWorkOrdersByTabs(this.tabs, this.params.query);
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Logout',
      message: 'Do you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Confirm',
          handler: async () => {
            console.log('Buy clicked');
            await this.authService.logout();
          }
        }
      ]
    });

    await alert.present();
  }

  numberReturn(length) {
    return new Array(length);
  }

  getActiveTabKey() {
    const activeTabs = this.tabs.filter(tab => tab.isActive);

    if (activeTabs.length) {
      return activeTabs[0].key;
    }

    return null;
  }

  setActiveTab(selectedTabKey, withUpdateParams = true) {
    this.tabs.map(tab => tab.isActive = tab.key === selectedTabKey);

    this.params.tab = selectedTabKey;

    if (withUpdateParams) {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: this.params,
        queryParamsHandling: 'merge', // remove to replace all query params by provided
        replaceUrl: true
      });
    }
  }

  async goToWorkOrder(uuid: string) {
    this.router.navigateByUrl('/work-order/view/' + uuid);
  }

  private setTabs() {
    environment.workOrderTabs.forEach(tab => {
      this.tabs.push(Object.assign({}, {isActive: false, total: 0}, tab));
    });
  }
}
