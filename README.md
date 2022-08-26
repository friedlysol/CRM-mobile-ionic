# CRM Mobile Ionic

## Run
``ionic cap run android -l -c --address 0.0.0.0``

## Setup
1. Clone repo
2. `npm install`
3. Generate www files - `ionic cap sync android` / `ionic cap build android`

## Resources
You can replace:
```
resources/
├── android
|   ├── icon-background.png
|   └── icon-foreground.png
├── icon.png
└── splash.png
```
And run:
```
npm install -g cordova-res
cordova-res ios --skip-config --copy
cordova-res android --skip-config --copy
```
to generate custom icons and splash screens for your app.


### Android
**ionic cap run android -l -c --address 0.0.0.0**

### IOS
https://help.apple.com/app-store-connect/#/devd274dd925

<key>NSCameraUsageDescription"</key>>
<string>need camera access to take pictures</string>
<key>NSPhotoLibraryUsageDescription"</key>>
<string>need photo library access to get pictures from there</string>
<key>NSLocationWhenInUseUsageDescription"</key>>
<string>need location access to find things nearby</string>
<key>NSPhotoLibraryAddUsageDescription"</key>>
<string>need photo library access to save pictures there</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need to track your location</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>We need to track your location while your device is locked.</string>
<key>UIBackgroundModes</key>
<array>
<string>location</string>
</array>
