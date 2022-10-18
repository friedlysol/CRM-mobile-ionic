// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  appUrl: 'https://ahd.friendlysol.com/',
  apiEndpoint: 'https://ahd.friendlysol.com/',
  production: false,
  company: 'ahd',
  companyName: 'American Home Design',
  authBy: 'email', //'device-id' | 'email' | 'phone-number'
  settings: {},
  pageSize: 15,
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
      isActive: true
    },
    {
      key: 'supplies-request',
      label: 'Supplies Request',
      icon: 'construct-outline',
      url: ['/supplies-request', 'list'],
      isActive: true
    },
    {
      key: 'vehicle-inspection',
      label: 'Vehicle Inspection',
      icon: 'car-sport-outline',
      url: ['/vehicle-inspection', 'daily'],
      isActive: true
    },
    {
      key: 'message-center',
      label: 'Message Center',
      icon: 'chatbubble-outline',
      url: ['/message-center', 'list'],
      isActive: true
    },
    {
      key: 'job-search',
      label: 'Job Search',
      icon: 'search-outline',
      url: ['/job-search', 'list'],
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
      work_order: 'WorkOrderService',
  }
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
