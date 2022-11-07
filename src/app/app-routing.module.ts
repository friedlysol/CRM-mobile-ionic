import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/guards/auth.guard';


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
  {path: '', redirectTo: '/work-order/list', pathMatch: 'full'},
  {path: '**', redirectTo: '/work-order'},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
