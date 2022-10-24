import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DailyInspectionInterface } from '@app/interfaces/daily-inspection.interface';
import { TypeInterface } from '@app/interfaces/type.interface';
import { VehicleInspectionsDatabase } from '@app/services/database/vehicle-inspection.database';
import { TypeService } from '@app/services/type.service';
import { UtilsService } from '@app/services/utils.service';
import { VehicleInspectionService } from '@app/services/vehicle-inspection.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-daily-inspection',
  templateUrl: './daily-inspection.page.html',
  styleUrls: ['./daily-inspection.page.scss'],
})
export class DailyInspectionPage implements OnInit {
  withoutPreview: boolean;
  redirectTo: string;

  questions: TypeInterface[] = [];
  inspection: DailyInspectionInterface = {
    vehicle_number: '',
    odometer_reading: '',
    note: '',
    route: '',
  };

  inspectionForm = new FormGroup({
    vehicleNumber: new FormControl('', [Validators.required]),
    odometerReading: new FormControl('', [Validators.required]),
    route: new FormControl('', [Validators.required]),
    note: new FormControl(),
  });
  isReadOnly: boolean;
  showErrors = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private typeService: TypeService,
    private vehicleInspectionDatabase: VehicleInspectionsDatabase,
    private vehicleInspectionService: VehicleInspectionService,
    public utilsService: UtilsService,
  ) { }

  get vehicleNumberCtrl() { return this.inspectionForm.get('vehicleNumber'); }
  get odometerReadingCtrl() { return this.inspectionForm.get('odometerReading'); }
  get routeCtrl() { return this.inspectionForm.get('route'); }
  get noteCtrl() { return this.inspectionForm.get('note'); }


  async ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.withoutPreview = params.get('withoutPreview') === '1';
      this.redirectTo = params.get('redirectTo');
    });

    this.inspection = await this.vehicleInspectionDatabase.getLastDaily();
    if(this.inspection){
      this.vehicleNumberCtrl.setValue(this.inspection.vehicle_number);
      this.odometerReadingCtrl.setValue(this.inspection.odometer_reading);
      this.routeCtrl.setValue(this.inspection.route);
      this.noteCtrl.setValue(this.inspection.note);
      this.isReadOnly = !this.withoutPreview;
    }else{
      this.isReadOnly = false;
    }

    this.questions = (await this.typeService.getByType('daily_inspection_questions'))
      .map(question => ({...question, type_key: question.type_key.split('.')[1]}));

  }

  onAnswerClick(question: TypeInterface, satisfactory: boolean){
    if(this.isReadOnly){
      return;
    }
    this.inspection[question.type_key] = satisfactory? 1: 0;
  }

  async onSaveClick(){
    if(this.inspectionForm.invalid){
      this.showErrors = true;
      this.inspectionForm.markAllAsTouched();
      return;
    }
    for(const question of this.questions){
      if(this.inspection[question.type_key] == null){
        this.showErrors = true;
        this.showErrorToast('Each questions should be "satisfactory" or "unsatisfactory"');
        return;
      }
    }

    this.inspection.vehicle_number = this.vehicleNumberCtrl.value;
    this.inspection.odometer_reading = this.odometerReadingCtrl.value;
    this.inspection.route = this.routeCtrl.value;
    this.inspection.note = this.noteCtrl.value;
    await this.vehicleInspectionDatabase.createDaily(this.inspection);
    if(this.redirectTo){
      this.router.navigateByUrl(this.redirectTo, {replaceUrl: true});
    }else{
      this.router.navigateByUrl('/work-order/list', {replaceUrl: true});
    }
  }

  onClearClick(){
    this.inspection = {
      vehicle_number: '',
      odometer_reading: '',
      note: '',
      route: '',
    };
    this.inspectionForm.reset();
    this.showErrors = false;
  }

  onNextClick(){
    this.onClearClick();
    this.isReadOnly = false;
  }

  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
    });
    toast.present();
  }

}
