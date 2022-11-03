import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IncidentsPageRoutingModule } from './incidents-routing.module';
import { IncidentsListPage } from './list/incidents-list.page';
import { SharedModule } from '@app/shared.module';
import { IncidentsFormPage } from './form/incidents-form.page';
import { InjuredPersonsFormComponent } from './form/injured-persons-form/injured-persons-form.component';
import { PersonFormComponent } from './form/person-form/person-form.component';

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
    InjuredPersonsFormComponent,
    PersonFormComponent,
  ],
})
export class IncidentsPageModule {}
