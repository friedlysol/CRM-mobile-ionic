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
to generate custom icons and splash screens for your
app.