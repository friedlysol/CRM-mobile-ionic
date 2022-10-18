import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from '@app/services/auth.service';
import { Router } from '@angular/router';
import { StorageService } from '@app/services/storage.service';
import { Device } from '@capacitor/device';
import { EventService } from '@app/services/event.service';

@Component({
  selector: 'app-sign-in-by-device-id',
  templateUrl: './sign-in-by-device-id.component.html',
  styleUrls: ['./sign-in-by-device-id.component.scss'],
})
export class SignInByDeviceIdComponent implements OnInit {
  public deviceId: string = null;
  public isLoading = false;

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private storageService: StorageService
  ) {
  }

  async ngOnInit() {
    try {
      const deviceId = await Device.getId();

      this.deviceId = deviceId.uuid;
    } catch (error) {
    }
  }

  async login() {
    this.isLoading = true;

    this.authService.loginByDeviceIdOrImei(this.deviceId)
      .then(async res => {
        this.isLoading = false;

        if (res) {
          await this.router.navigateByUrl('/', {replaceUrl: true});

          EventService.startSync.next(true);
        } else {
          return this.loginFailed();
        }
      })
      .catch(async (err) => {
        this.isLoading = false;

        return this.loginFailed();
      });
  }

  private async loginFailed() {
    const alert = await this.alertController.create({
      header: 'Login Failed',
      message: `Your device was not authorized.<br />Please contact office.`,
      buttons: ['Ok']
    });

    await alert.present();
  }
}
