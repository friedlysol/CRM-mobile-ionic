import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StorageService } from '@app/services/storage.service';
import { AuthService } from '@app/services/auth.service';
import { App } from '@capacitor/app';
import { environment } from '@env/environment';
import { PushNotificationService } from '@app/services/push-notifications.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { MenuItemInterface } from '@app/interfaces/menu-item-interface';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public appName: string = null;

  public menu: MenuItemInterface[] = [];

  constructor(
    private appVersion: AppVersion,
    private authService: AuthService,
    private platform: Platform,
    private storageService: StorageService,
    private zone: NgZone,
    private pushNotificationService: PushNotificationService,
  ) {
    environment.menu.map((item: MenuItemInterface) => {
      this.menu.push(item);
    });
  }

  ngOnInit() {
    this.storageService.init();
    this.initializeApp();
  }

  async initializeApp() {
    this.platform.ready()
      .then(async () => {
        await this.pushNotificationService.initEventListeners();
        await this.pushNotificationService.startService();
      });

    App.addListener('appUrlOpen', (data: any) => {
      this.zone.run(() => {
        const appUrl = environment.appUrl;

        console.log('appUrlOpen', appUrl, data, data.url.search(appUrl));

        if (data?.url && data.url.search(appUrl) > -1) {
          const path = data.url.replace(appUrl, '').split('/');

          console.log('appUrlOpen path', path);

          switch (path[0]) {
            //...
          }
        }
      });
    });

    const appVersion = await this.appVersion.getVersionNumber();

    this.appName = environment.companyName + ' ' + appVersion;
  }

  logout() {
    this.authService.logout();
  }

  exit() {
    this.platform.backButton.subscribe(() => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      navigator['app'].exitApp();
    });
  }
}
