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
  defaultPageSize: 20,
  galleryPageSize: 15,
  surveyPageSize: 10,
  dateFormat: 'MM/DD/YYYY',
  datetimeFormat: 'MM/DD/YYYY hh:mm A',
  databaseDateFormat: 'YYYY-MM-DD HH:mm:ss',
  firstDayOfWeek: 1,
  weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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
      key: 'time-sheets',
      label: 'Time Sheets',
      icon: 'calendar-outline',
      url: ['/time-sheets', 'list'],
      isActive: true
    },
    {
      key: 'supplies-request',
      label: 'Supplies Requests',
      icon: 'construct-outline',
      url: ['/supplies-request', 'list'],
      isActive: true
    },
    {
      key: 'purchase-order',
      label: 'Purchase orders',
      icon: 'cart-outline',
      url: ['/purchase-order', 'list'],
      isActive: true
    },
    {
      key: 'bill',
      label: 'Bills',
      icon: 'receipt-outline',
      url: ['/bill', 'list'],
      isActive: false
    },
    {
      key: 'message-center',
      label: 'Message Center',
      icon: 'chatbubble-outline',
      url: ['/message-center', 'list'],
      isActive: true
    },
    {
      key: 'incidents',
      label: 'Incidents',
      icon: 'warning-outline',
      url: ['/incidents', 'list'],
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
  techStatuses: {
    assigned: 1512,
    inRoute: 1513,
    wip: 1511,
    completed: 1514,
    incomplete: 1515
  },
  techStatusDependencies: {},
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
      isActive: true,
      withTotal: true
    },
    {
      key: 'today',
      label: 'Today',
      withTotal: true
    },
    {
      key: 'completed',
      label: 'Completed',
      withTotal: false
    },
    {
      key: 'calendar',
      label: 'Calendar',
      withTotal: false
    },
  ],
  tableToServiceMap: {
    work_orders: 'WorkOrderService',
  },
  defaultRoutes: []
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

// Status must move first to In Route from Assigned
environment.techStatusDependencies[environment.techStatuses.assigned] = [environment.techStatuses.inRoute];

// Status after In Route should move only to WIP
environment.techStatusDependencies[environment.techStatuses.inRoute] = [environment.techStatuses.assigned, environment.techStatuses.wip];

// Status must move to Incomplete only from WIP (not from In Route previous one)
environment.techStatusDependencies[environment.techStatuses.wip] = [environment.techStatuses.inRoute, environment.techStatuses.incomplete, environment.techStatuses.completed];

// Incomplete status can only be changed to WIP and In Route
environment.techStatusDependencies[environment.techStatuses.incomplete] = [environment.techStatuses.inRoute, environment.techStatuses.wip];
