/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/services/auth.service';
import { Router } from '@angular/router';
import { CredentialsInterface } from '@app/interfaces/credentials';
import { AlertController } from '@ionic/angular';
import { WorkOrderService } from '@app/services/workorder.service';
import { finalize } from 'rxjs/operators';
import { SettingsService } from '@app/services/settings.service';

@Component({
    selector: 'app-work-order-list',
    templateUrl: './work-order-list.page.html',
    styleUrls: ['./work-order-list.page.scss'],
})
export class WorkOrderListPage implements OnInit {
    listData: any = [];
    params = { limit: 20, page: 1 };
    numberOfWorkOrders = 0;
    pagination = {
        page: 0,
        last_page: 0,
    };
    paginationButtons = [];
    isLoading = false;

    constructor(
        private authService: AuthService,
        private alertCtrl: AlertController,
        private woService: WorkOrderService,
        private settingsService: SettingsService
    ) {
    }

    ngOnInit() {
        this.loadList();
    }

    sync() {
        this.settingsService.sync();
    }

    changePage(i: number) {
        this.params.page = i;
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
                        if (i + 1 <= 0) { continue; }
                        pag.push(i + 1);
                        if (pag.length >= 5) { break; }
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
}
