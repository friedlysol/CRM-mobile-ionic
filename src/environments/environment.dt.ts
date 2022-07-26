// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  appUrl: 'https://hw911.friendlysol.com/',
  apiEndpoint: 'https://hw911.friendlysol.com/',
  production: true,
  company: 'dt',
  companyName: 'Design Temperature',
  authBy: 'email', //'device-id' | 'email' | 'phone-number'
  settings: {},
  defaultPageSize: 20,
  galleryPageSize: 15,
  surveyPageSize: 10,
  dateFormat: 'MM/DD/YYYY',
  datetimeFormat: 'MM/DD/YYYY hh:mm A',
  databaseDateFormat: 'YYYY-MM-DD HH:mm:ss',
  firstDayOfWeek: 1,
  countryCodes: [
    {
      label: 'USA (+1)',
      value: '+1'
    },
    {
      label: 'Poland (+48)',
      value: '+48'
    }
  ],
  menu: [
    {
      key: 'work-order',
      label: 'Open Work Orders',
      icon: 'clipboard-outline',
      url: ['/work-order', 'list'],
      isActive: false
    },
    {
      key: 'time-sheets',
      label: 'Time Sheets',
      icon: 'calendar-outline',
      url: ['/time-sheets', 'list'],
      isActive: false
    },
    {
      key: 'supplies-request',
      label: 'Supplies Requests',
      icon: 'construct-outline',
      url: ['/supplies-request', 'list'],
      isActive: false
    },
    {
      key: 'purchase-order',
      label: 'Purchase orders',
      icon: 'cart-outline',
      url: ['/purchase-order', 'list'],
      isActive: false
    },
    {
      key: 'bill',
      label: 'Bills',
      icon: 'receipt-outline',
      url: ['/bill', 'list'],
      isActive: true
    },
    {
      key: 'message-center',
      label: 'Message Center',
      icon: 'chatbubble-outline',
      url: ['/message-center', 'list'],
      isActive: false
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: 'settings-outline',
      url: ['/settings', 'list'],
      isActive: true
    },
  ],
  techStatuses: {
    assigned: 1512,
    inRoute: 1513,
    wip: 1511,
    completed: 1514,
    incomplete: 1515
  },
  workOrderStatuses: {
    issued: 'issued',
    confirmed: 'confirmed',
    inProgress: 'in_progress',
    inProgressAndHold: 'in_progress_and_hold',
    canceled: 'canceled',
    completed: 'completed'
  },
  workOrderTabs: [
    {
      key: 'open',
      label: 'Open',
      isActive: true
    },
    {
      key: 'today',
      label: 'Today',
    },
    {
      key: 'completed',
      label: 'Completed',
    },
  ],
  tableToServiceMap: {
      work_orders: 'WorkOrderService',
  },
  defaultRoutes: [
    {path: '', redirectTo: '/bill/list', pathMatch: 'full'},
    {path: '**', redirectTo: '/bill'},
  ]
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
