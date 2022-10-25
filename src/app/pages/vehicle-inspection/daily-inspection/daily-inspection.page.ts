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
    vehicleNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{5}')]),
    odometerReading: new FormControl('', [Validators.required]),
    note: new FormControl(),
  });
  isPreview: boolean;
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

  get vehicleNumberCtrl() {
    return this.inspectionForm.get('vehicleNumber');
  }
  get odometerReadingCtrl() {
    return this.inspectionForm.get('odometerReading');
  }
  get noteCtrl() {
    return this.inspectionForm.get('note');
  }


  async ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.withoutPreview = params.get('withoutPreview') === '1';
      this.redirectTo = params.get('redirectTo');
    });

    const prevInspection = await this.vehicleInspectionDatabase.getLastDaily();
    if(prevInspection){
      this.inspection = prevInspection;
      this.vehicleNumberCtrl.setValue(this.inspection.vehicle_number);
      this.odometerReadingCtrl.setValue(this.inspection.odometer_reading);
      this.noteCtrl.setValue(this.inspection.note);
      this.isPreview = !this.withoutPreview;
    }else{
      this.isPreview = false;
    }

    this.questions = await this.typeService.getByTypeWithMappedKeys('daily_inspection_questions');

  }

  onAnswerClick(question: TypeInterface, satisfactory: boolean){
    if(!this.isPreview){
      this.inspection[question.type_key] = satisfactory? 1: 0;
    }
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
    this.inspection.note = this.noteCtrl.value;
    await this.vehicleInspectionDatabase.createDaily(this.inspection);
    this.vehicleInspectionService.setIsDailyInspectionRequired(false);

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
    this.isPreview = false;
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
