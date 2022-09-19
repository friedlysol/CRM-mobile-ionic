import { Injectable } from '@angular/core';
import { Api } from '@app/providers';

import { CredentialsInterface } from '@app/pages/auth/interfaces/credentials.interface';
import { Device } from '@capacitor/device';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { HttpClient } from '@angular/common/http';
import { StaticService } from '@app/services/static.service';

@Injectable({
  providedIn: 'root'
})
export class AuthApi extends Api {
  constructor(public http: HttpClient, private appVersion: AppVersion, private staticService: StaticService) {
    super(http);
  }

  loginByDeviceIdOrImei(deviceId: string, imei: string = null) {
    const loginData = {
      device_id: deviceId,
      imei
    };

    return this.http.post(`${this.apiEndpoint}mobile-auth/imei-token`, loginData);
  }

  loginByEmail(credentials: CredentialsInterface, deviceId: string) {
    const params = Object.assign({
      grant: 'password',
      is_new_crm: 1,
      is_mobile: 1,
      device_id: deviceId
    }, credentials);

    return this.http.post(`${this.apiEndpoint}auth/token`, params);
  }

  loginByPhoneNumber(number: string, code: string, deviceData: any) {
    const params = Object.assign({}, {number, code}, deviceData);

    return this.http.post(`${this.apiEndpoint}mobile-auth/token`, params);
  }

  getConfirmationCode(number: string) {
    return this.http.post(`${this.apiEndpoint}mobile-auth`, {number});
  }

  async deviceTokenSync(): Promise<any> {
    const params = await this.getDeviceData();

    if(params.device_token) {
      return this.http.post(`${this.apiEndpoint}mobile/devicetoken/sync`, params)
        .toPromise();
    } else {
      return Promise.resolve(false);
    }
  };

  async getDeviceData(): Promise<any> {
    const appVersion = await this.appVersion.getVersionNumber();
    const deviceInfo = await Device.getInfo();

    return {
      app_version: appVersion,
      device_system_version: deviceInfo.osVersion,
      device_name: deviceInfo.name,
      device_model: deviceInfo.model,
      device_type: deviceInfo.platform,
      device_token: this.staticService.deviceToken,
      device_token_type: this.staticService.deviceTokenType || 'fcm'
    };
  };
}
