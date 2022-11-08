import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IncidentsPageRoutingModule } from './incidents-routing.module';
import { IncidentsListPage } from './list/incidents-list.page';
import { SharedModule } from '@app/shared.module';
import { IncidentsFormPage } from './form/incidents-form.page';
import { PersonFormComponent } from './form/person-form/person-form.component';
import { IncidentsViewPage } from './view/incidents-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    IncidentsPageRoutingModule,
  ],
  declarations: [
    IncidentsListPage,
    IncidentsFormPage,
    PersonFormComponent,
    IncidentsViewPage,
  ],
})
export class IncidentsPageModule {}
