import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {AuthGuard} from '@app/guards/auth.guard';
import { SignInAuthGuard } from './guards/sign-in-auth-guard';

const routes: Routes = [
  {
    path: 'work-order',
    loadChildren: () => import('./pages/work-order/work-order.module').then( m => m.WorkOrderModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'sign-in',
    loadChildren: () => import('./pages/sign-in/sign-in.module').then( m => m.SignInPageModule),
    canActivate: [SignInAuthGuard]
  },
  { path: '',   redirectTo: '/work-order', pathMatch: 'full' },
  {path: '**', redirectTo: '/work-order'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
