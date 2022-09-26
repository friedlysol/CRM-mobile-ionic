import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { ApiInterceptor } from '@app/providers/api.interceptor';
import { APP_INITIALIZER, Injectable, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { BrowserModule, HammerGestureConfig, HammerModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { Camera } from '@ionic-native/camera/ngx';
import { CameraPreview } from '@awesome-cordova-plugins/camera-preview/ngx';
import { Device } from '@ionic-native/device/ngx';
import { Drivers } from '@ionic/storage';
import { EventService } from '@app/services/event.service';
import { File, File as FileNgx } from '@ionic-native/file/ngx';
import { HTTP_INTERCEPTORS, HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy, Platform } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { LoggerService } from '@app/services/logger.service';
import { OrderModule } from 'ngx-order-pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { RouteReuseStrategy } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { StaticService } from '@app/services/static.service';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { DatabaseService } from '@app/services/database.service';
import { IConfig, NgxMaskModule } from 'ngx-mask';
import { SmsRetriever } from '@ionic-native/sms-retriever/ngx';
import { SharedModule } from '@app/shared.module';

export const appInitFactory = (databaseService: DatabaseService, platform: Platform, staticService: StaticService) => async () => {
  await platform.ready().then(async () => {
    await databaseService.init();
    await staticService.init();
  });
};

@Injectable()
export class MyHammerConfig extends HammerGestureConfig {
  overrides = {
    swipe: {direction: Hammer.DIRECTION_HORIZONTAL},
  };
}

const maskConfig: Partial<IConfig> = {
  validation: false,
};

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpClientJsonpModule,
    IonicModule.forRoot({
      swipeBackEnabled: false,
      scrollAssist: false,
      scrollPadding: false
    }),
    IonicStorageModule.forRoot({
      name: 'database',
      // eslint-disable-next-line no-underscore-dangle
      driverOrder: [Drivers.LocalStorage]
    }),
    NgxMaskModule.forRoot(maskConfig),
    AppRoutingModule,
    OrderModule,
    SharedModule,
    ReactiveFormsModule,
    HammerModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true
    },
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitFactory,
      deps: [DatabaseService, Platform, StaticService],
      multi: true
    },
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: MyHammerConfig,
    },
    AndroidPermissions,
    AppVersion,
    Camera,
    CameraPreview,
    Device,
    EventService,
    File,
    FileNgx,
    LoggerService,
    SplashScreen,
    SQLite,
    StaticService,
    StatusBar,
    Toast,
    SmsRetriever,
  ],
  bootstrap: [AppComponent],
  exports: [

  ]
})
export class AppModule {
}
