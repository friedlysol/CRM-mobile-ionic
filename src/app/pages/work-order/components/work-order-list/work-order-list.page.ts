import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/pages/auth/services/auth.service';
import { AlertController } from '@ionic/angular';
import { WorkOrderService } from '@app/pages/work-order/services/workorder.service';
import { finalize } from 'rxjs/operators';
import { SettingsService } from '@app/pages/settings/services/settings.service';
import { EventService } from '@app/services/event.service';
import { TabInterface } from '@app/interfaces/tab.interface';
import { environment } from '@env/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-work-order-list',
  templateUrl: './work-order-list.page.html',
  styleUrls: ['./work-order-list.page.scss'],
})
export class WorkOrderListPage implements OnInit {
  listData: any = [];

  params: any = {};

  numberOfWorkOrders = 0;
  pagination = {
    page: 0,
    last_page: 0,
  };
  paginationButtons = [];
  isLoading = false;

  tabs: TabInterface[] = [];

  constructor(
    private route: ActivatedRoute,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router,
    private woService: WorkOrderService,
    private settingsService: SettingsService
  ) {
    this.setTabs();

    console.log('tabs', this.tabs);
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      if (params) {
        this.params = Object.assign({}, params);
      }

      if(this.params.hasOwnProperty('tab')) {
        this.setActiveTab(this.params.tab, false);
      }

      console.log('params', this.params, params);

      this.loadList();
    });
  }

  sync() {
    EventService.startSync.next(true);
  }

  changePage(i: number) {
    //this.params.page = i;
    this.loadList();
  }

  loadList() {
    this.isLoading = true;
    this.woService
      .getList(this.params)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe(
        (response: any) => {
          this.listData = response.response.data;
          this.pagination.page = response.response.current_page;
          this.pagination.last_page = response.response.last_page;
          this.numberOfWorkOrders = response.response.total;
          const pag = [];
          const trimStart = this.pagination.page - 3;
          const trimEnd = this.pagination.last_page;
          for (let i = trimStart; i < trimEnd; i++) {
            if (i + 1 <= 0) {
              continue;
            }
            pag.push(i + 1);
            if (pag.length >= 5) {
              break;
            }
          }
          this.paginationButtons = pag;
          console.log(this.paginationButtons);
        },
        async (error) => {
          console.log(error);
          const alert = await this.alertCtrl.create({
            header: 'Error',
            message: 'Error while loading list!',
            buttons: ['OK']
          });

          await alert.present();
        }
      );
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

  private setTabs() {
    environment.workOrderTabs.forEach(tab => {
      this.tabs.push(Object.assign({}, {isActive: false, total: 0}, tab));
    });
  }
}
