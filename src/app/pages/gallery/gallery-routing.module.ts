import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GalleryListPage } from './gallery-list/gallery-list.page';

const routes: Routes = [
  {
    path: 'list/:objectType/:objectUuid',
    component: GalleryListPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GalleryRoutingModule {}
