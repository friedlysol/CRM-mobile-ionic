import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuthPageRoutingModule } from './auth-routing.module';

import { AuthPage } from './auth.page';
import {SignInByPhoneNumberComponent} from '@app/pages/auth/components/sign-in-by-phone-number/sign-in-by-phone-number.component';
import {SignInByDeviceIdComponent} from '@app/pages/auth/components/sign-in-by-device-id/sign-in-by-device-id.component';
import {SignInByEmailComponent} from '@app/pages/auth/components/sign-in-by-email/sign-in-by-email.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuthPageRoutingModule
  ],
    declarations: [AuthPage, SignInByDeviceIdComponent, SignInByEmailComponent, SignInByPhoneNumberComponent]
})
export class AuthPageModule {}
