import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DatabaseService } from './database.service';
import { LoadingController, Platform } from '@ionic/angular';
import { ConnectionStatus, Network } from '@capacitor/network';
import { EventService } from '@app/services/event.service';
import { Location } from '@capacitor-community/background-geolocation';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class StaticService {
  public invalidToken = new BehaviorSubject<boolean | null>(null);
  public startSync = new BehaviorSubject<boolean | null>(null);

  public authEmail: string = null;
  public deviceToken: string = null;
  public deviceTokenType: string = null;

  public isFirstSync = true;
  public isAndroid = false;
  public isIos = false;
  public isTablet = !!navigator.userAgent.match(/iPad/i);

  public networkStatus: ConnectionStatus = {
    connected: false,
    connectionType: 'unknown'
  };

  public location: Location;

  public settings: Record<string, any> = {};

  private loading;

  constructor(
    private databaseService: DatabaseService,
    private loadingController: LoadingController,
    private platform: Platform
  ) {
    this.platform.ready()
      .then(() => {
        this.isAndroid = this.platform.is('android')
        this.isIos = this.platform.is('ios')
        this.isTablet = this.platform.is('tablet');

        console.log('platform', {
          isAndroid: this.isAndroid,
          isIos: this.isIos,
          isTablet: this.isTablet
        })
      });
  }

  static isCompany(company: string) {
    return environment.company === company;
  }

  async init() {
    Network.addListener('networkStatusChange', status => {
      console.log('Network status changed', status);

      this.networkStatus = status;
    });

    Network.getStatus().then(status => {
      this.networkStatus = status;

      EventService.networkStatus.next(status);
    });
  }


  clearSyncStatus() {
    this.startSync.next(null);
  }

  async showLoader(message?: string, duration = 3000) {
    this.loading = await this.loadingController.create({message, duration});
    this.loading.present();
  }

  hideLoader() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  compareAppVersion(a, b) {
    const regExpStrip = /(\.0+)+$/;

    a = a.replace(regExpStrip, '').split('.');
    b = b.replace(regExpStrip, '').split('.');

    const minLength = Math.min(a.length, b.length);

    for (let index = 0; index < minLength; index++) {
      const diff = parseInt(a[index], 10) - parseInt(b[index], 10);
      if (diff) {
        return diff;
      }
    }
    return a.length - b.length;
  };
}
