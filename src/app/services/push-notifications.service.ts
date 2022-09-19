import { AuthService } from '@app/pages/auth/services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { ActionPerformed as ActionPerformedLocal, LocalNotifications } from '@capacitor/local-notifications';
import { NavController, Platform } from '@ionic/angular';
import { ActionPerformed, PushNotifications, PushNotificationSchema, Token, } from '@capacitor/push-notifications';
import { environment } from '@env/environment';
import { StaticService } from '@app/services/static.service';


@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  apiEndpoint = `${environment.apiEndpoint}/api/user/push-notification/`;

  public isTokenRegistered: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private platform: Platform,
    private navController: NavController,
    private ngzone: NgZone,
    private staticService: StaticService
  ) {

  }

  /** Initializes events
   *
   * initEventListeners() // run this on app start to init events
   * startService() // run this after events (user should be logged in)
   *
   */
  async initEventListeners(): Promise<any> {
    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
      async (token: Token) => {
        console.log('Push registration success, token: ' + token.value);

        this.staticService.deviceToken = token.value;
        this.staticService.deviceTokenType = 'fcm';
      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error: any) => {
        console.log('Error on registration: ' + JSON.stringify(error));
      }
    );

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push received: ' + JSON.stringify(notification));

        // We schedule a LocalNotification 1 second later since Capacitor for Android doesn't show anything in this case
        if (this.platform.is('android')) {
          const extraData: any = notification.data;

          extraData.notifId = notification.id;

          LocalNotifications.schedule({
            notifications: [{
              title: notification.title,
              body: notification.body,
              id: new Date().getUTCMilliseconds(),
              schedule: {
                at: new Date(Date.now() + 1000)
              },
              extra: extraData,
              channelId: 'pop-notifications'
            }]
          });
        }
      }
    );

    if (this.platform.is('android')) {
      LocalNotifications.addListener('localNotificationActionPerformed',
        async (notificationAction: ActionPerformedLocal) => {
          console.log('Local Push action performed: ' + JSON.stringify(notificationAction));

          await this.notificationRouting(
            notificationAction.notification.extra.notifId,
            notificationAction.notification.extra,
            false
          );
        }
      );
    }

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      async (notification: ActionPerformed) => {
        console.log('Push action performed: ' + JSON.stringify(notification));

        await this.notificationRouting(
          notification.notification.id,
          notification?.notification?.data,
          true
        );
      }
    );
  }

  /**
   * Asks users for permission and registers token in user's device
   * Call it after initializing events and after user is logged in
   */
  async startService() {
    // Request permission to use local push notifications on android
    if (this.platform.is('android')) {
      await LocalNotifications.requestPermissions();
    }

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermissions()
      .then(result => {
        if (result.receive === 'granted') {
          // Register with Apple / Google to receive push via APNS/FCM
          PushNotifications.register();
        } else {
          // Show some error
          console.log('PushNotifications permissions not granted!');
        }
      });
  }

  async notificationRouting(id: any, data: any, isPushNotif: boolean) {
    this.ngzone.run(async () => {

    });
  }
}
