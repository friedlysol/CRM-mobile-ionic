import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/guards/auth.guard';


const routes: Routes = [
  {
    path: 'work-order',
    loadChildren: () => import('./pages/work-order/work-order.module').then(m => m.WorkOrderModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'sign-in',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthPageModule),
  },
  {path: '', redirectTo: '/work-order', pathMatch: 'full'},
  {path: '**', redirectTo: '/work-order'},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
