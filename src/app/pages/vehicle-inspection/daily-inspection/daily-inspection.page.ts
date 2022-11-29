import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DailyInspectionInterface } from '@app/interfaces/daily-inspection.interface';
import { TypeInterface } from '@app/interfaces/type.interface';
import { VehicleInspectionsDatabase } from '@app/services/database/vehicle-inspection.database';
import { TypeService } from '@app/services/type.service';
import { UtilsService } from '@app/services/utils.service';
import { IonContent, ToastController } from '@ionic/angular';
import { VehicleInspectionService } from '@app/services/vehicle-inspection.service';

@Component({
  selector: 'app-daily-inspection',
  templateUrl: './daily-inspection.page.html',
  styleUrls: ['./daily-inspection.page.scss'],
})
export class DailyInspectionPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild('odometerReading', {static: false}) ionOdometerReading: { setFocus: () => void; setSelectionRange: () => void };

  prevValues = {
    vehicleNumber: '',
    odometerReading: ''
  }

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
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private typeService: TypeService,
    private vehicleInspectionsDatabase: VehicleInspectionsDatabase,
    private vehicleInspectionService: VehicleInspectionService,
    public utilsService: UtilsService,
  ) {
  }

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
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.withoutPreview = params.get('withoutPreview') === '1';
      this.redirectTo = params.get('redirectTo');
    });

    const prevInspection = await this.vehicleInspectionsDatabase.getLastDaily();

    if (prevInspection) {
      this.inspection = prevInspection;
      this.vehicleNumberCtrl.setValue(this.inspection.vehicle_number);
      this.odometerReadingCtrl.setValue(this.inspection.odometer_reading);
      this.noteCtrl.setValue(this.inspection.note);
      this.isPreview = !this.withoutPreview;
    } else {
      this.isPreview = false;
    }

    this.questions = await this.typeService.getByTypeWithMappedKeys('daily_inspection_questions');
  }

  async ionViewDidEnter() {
    this.vehicleInspectionsDatabase.getLastVinAndOdometer()
      .then(result => {
        console.log('getLastVinAndOdometer', result);
        if (result) {
          this.prevValues.vehicleNumber = result.vehicle_number;
          this.prevValues.odometerReading = result.odometer_reading;

          this.setVinAndOdometer();
        }
      });
  }

  onAnswerClick(question: TypeInterface, satisfactory: boolean) {
    if (!this.isPreview) {
      this.inspection[question.type_key] = satisfactory ? 1 : 0;
    }
  }

  async onSaveClick() {
    if (this.inspectionForm.invalid) {
      this.showErrors = true;
      this.inspectionForm.markAllAsTouched();

      return;
    }

    for (const question of this.questions) {
      if (this.inspection[question.type_key] == null) {
        this.showErrors = true;

        return this.showErrorToast('Each questions should be "satisfactory" or "unsatisfactory"');
      }
    }

    this.inspection.vehicle_number = this.vehicleNumberCtrl.value;
    this.inspection.odometer_reading = this.odometerReadingCtrl.value;
    this.inspection.note = this.noteCtrl.value;

    await this.vehicleInspectionsDatabase.createDaily(this.inspection);

    this.vehicleInspectionService.setIsDailyInspectionRequired(false);

    if (this.redirectTo) {
      return this.router.navigateByUrl(this.redirectTo, {replaceUrl: true});
    } else {
      return this.router.navigateByUrl('/work-order/list', {replaceUrl: true});
    }
  }

  onClearClick() {
    this.inspection = {
      vehicle_number: '',
      odometer_reading: '',
      note: '',
      route: '',
    };

    this.inspectionForm.reset();
    this.showErrors = false;

    this.setVinAndOdometer();
  }

  onNextClick() {
    this.onClearClick();
    this.isPreview = false;

    setTimeout(() => {
      this.ionOdometerReading.setFocus();
    }, 200);

    return this.content.scrollToTop(0);
  }

  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
    });

    return toast.present();
  }

  private setVinAndOdometer() {
    this.inspectionForm.controls.vehicleNumber.setValue(this.prevValues.vehicleNumber);
    this.inspectionForm.controls.odometerReading.setValue(this.prevValues.odometerReading);
  }

  onlyNumber(control: string) {
    const value = this.inspectionForm.controls[control].value;

    if (value && value.search(/[^0-9]/) > -1) {
      this.inspectionForm.controls[control].setValue(value.replace(/[^0-9]/, ''));
    }
  }
}
