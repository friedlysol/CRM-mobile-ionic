import { environment } from '@env/environment';
import {Injectable} from '@angular/core';
import {Api} from '@app/providers';

import {CredentialsInterface} from '@app/interfaces/credentials';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthApi extends Api {
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
}
