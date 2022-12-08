import { NgModule } from '@angular/core';
import { PreloadAllModules, Route, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/guards/auth.guard';
import { environment } from '@env/environment';


const routes: Routes = [
  {
    path: 'work-order',
    loadChildren: () => import('./pages/work-order/work-order.module').then(m => m.WorkOrderModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'asset',
    loadChildren: () => import('./pages/asset/asset.module').then(m => m.AssetPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'supplies-request',
    loadChildren: () => import('./pages/supplies-request/supplies-request.module').then(m => m.SuppliesRequestModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'survey',
    loadChildren: () => import('./pages/survey/survey.module').then(m => m.SurveyPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'vehicle-inspection',
    loadChildren: () => import('./pages/vehicle-inspection/vehicle-inspection.module').then(m => m.VehicleInspectionModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'message-center',
    loadChildren: () => import('./pages/message-center/message-center.module').then(m => m.MessageCenterModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gallery',
    loadChildren: () => import('./pages/gallery/gallery.module').then(m => m.GalleryModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'time-sheets',
    loadChildren: () => import('./pages/time-sheets/time-sheets.module').then(m => m.TimeSheetsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'bill',
    loadChildren: () => import('./pages/bill/bill.module').then(m => m.BillModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'purchase-order',
    loadChildren: () => import('./pages/purchase-order/purchase-order.module').then(m => m.PurchaseOrderModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'sign-in',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthPageModule),
  },
  {
    path: 'incidents',
    loadChildren: () => import('./pages/incidents/incidents.module').then(m => m.IncidentsPageModule)
  },
  {
    path: 'calendar-views',
    loadChildren: () => import('./pages/calendar-views/calendar-views.module').then( m => m.CalendarViewsPageModule)
  },


];

if (environment.hasOwnProperty('defaultRoutes') && environment.defaultRoutes.length) {
  environment.defaultRoutes.map(item => routes.push(item as Route));
} else {
  routes.push({path: '', redirectTo: '/calendar-views/list', pathMatch: 'full'});
  routes.push({path: '**', redirectTo: '/calendar-views'});
}
console.log('routes', routes);

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
