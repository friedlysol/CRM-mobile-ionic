import { Component, OnInit } from '@angular/core';
import { Device } from '@capacitor/device';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from '@app/pages/auth/services/auth.service';
import { Router } from '@angular/router';
import { CredentialsInterface } from '@app/pages/auth/interfaces/credentials.interface';
import { StorageService } from '@app/services/storage.service';

@Component({
  selector: 'app-sign-in-by-email',
  templateUrl: './sign-in-by-email.component.html',
  styleUrls: ['./sign-in-by-email.component.scss'],
})
export class SignInByEmailComponent implements OnInit {
  public credentials: CredentialsInterface = {
    username: null,
    password: null
  };

  public isLoading = false;

  private AUTH_EMAIL = 'auth-email';
  private deviceId = null;

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private storageService: StorageService
  ) {
  }

  async ngOnInit() {
    this.credentials.username = await this.storageService.get(this.AUTH_EMAIL);
  }

  async login() {
    this.isLoading = true;

    try {
      const id = await Device.getId();

      this.deviceId = id.uuid;
    } catch (error) {
      console.log(error);
    }

    this.authService.loginByEmail({
      email: this.credentials.username,
      password: this.credentials.password
    }, this.deviceId)
      .then(async res => {
        this.isLoading = false;

        if (res) {
          await this.router.navigateByUrl('/', {replaceUrl: true});
        } else {
          return this.loginFailed();
        }
      })
      .catch(async (err) => {
        this.isLoading = false;

        return this.loginFailed();
      });
  }

  gotoNextField(nextElement) {
    nextElement.setFocus();
  }

  private async loginFailed() {
    const alert = await this.alertController.create({
      header: 'Login Failed',
      message: 'Email address or password is wrong',
      buttons: ['Ok']
    });

    await alert.present();
  }
}
