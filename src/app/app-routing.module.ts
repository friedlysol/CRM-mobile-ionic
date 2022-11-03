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
    path: 'supplies-request',
    loadChildren: () => import('./pages/supplies-request/supplies-request.module').then(m => m.SuppliesRequestModule)
  },
  {
    path: 'survey',
    loadChildren: () => import('./pages/survey/survey.module').then(m => m.SurveyPageModule)
  },
  {
    path: 'vehicle-inspection',
    loadChildren: () => import('./pages/vehicle-inspection/vehicle-inspection.module').then(m => m.VehicleInspectionModule)
  },
  {
    path: 'message-center',
    loadChildren: () => import('./pages/message-center/message-center.module').then(m => m.MessageCenterModule)
  },
  {
    path: 'gallery',
    loadChildren: () => import('./pages/gallery/gallery.module').then(m => m.GalleryModule),
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'sign-in',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthPageModule),
  },
  {
    path: 'time-sheets',
    loadChildren: () => import('./pages/time-sheets/time-sheets.module').then( m => m.TimeSheetsPageModule)
  },
  {
    path: 'incidents',
    loadChildren: () => import('./pages/incidents/incidents.module').then( m => m.IncidentsPageModule)
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
