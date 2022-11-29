import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TypeInterface } from '@app/interfaces/type.interface';
import { WeeklyInspectionInterface } from '@app/interfaces/weekly-inspection.interface';
import { DatabaseService } from '@app/services/database.service';
import { VehicleInspectionsDatabase } from '@app/services/database/vehicle-inspection.database';
import { FileService } from '@app/services/file.service';
import { TypeService } from '@app/services/type.service';
import { VehicleInspectionService } from '@app/services/vehicle-inspection.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-weekly-inspection',
  templateUrl: './weekly-inspection.page.html',
  styleUrls: ['./weekly-inspection.page.scss'],
})
export class WeeklyInspectionPage implements OnInit {
  redirectTo: string;

  prevValues = {
    vehicleNumber: '',
    odometerReading: ''
  }

  photosTypes: TypeInterface[] = [];
  inspection: WeeklyInspectionInterface = {
    uuid: this.databaseService.getUuid(),
    oil: null,
    brake: null,
    washer: null,
    jack: null,
    tread: null,
    spare_tire: null,
    tires_pressure_front_driver: null,
    tires_pressure_front_passenger: null,
    tires_pressure_rear_driver: null,
    tires_pressure_rear_passenger: null,
    card_in_vehicle: null,
    registration_in_vehicle: null
  };
  showErrors = false;

  inspectionForm = new FormGroup({
    vehicleNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{5}$')]),
    odometerReading: new FormControl('', [Validators.required]),
    frontDriver: new FormControl('', [Validators.required]),
    rearDriver: new FormControl('', [Validators.required]),
    frontPassenger: new FormControl('', [Validators.required]),
    rearPassenger: new FormControl('', [Validators.required]),
  });

  constructor(
    private alertController: AlertController,
    private databaseService: DatabaseService,
    private fileService: FileService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private typeService: TypeService,
    private vehicleInspectionsDatabase: VehicleInspectionsDatabase,
    private vehicleInspectionService: VehicleInspectionService,
  ) {
  }

  get vehicleNumberCtrl() {
    return this.inspectionForm.controls.vehicleNumber;
  }

  get odometerReadingCtrl() {
    return this.inspectionForm.controls.odometerReading;
  }

  get frontDriverCtrl() {
    return this.inspectionForm.controls.frontDriver;
  }

  get rearDriverCtrl() {
    return this.inspectionForm.controls.rearDriver;
  }

  get frontPassengerCtrl() {
    return this.inspectionForm.controls.frontPassenger;
  }

  get rearPassengerCtrl() {
    return this.inspectionForm.controls.rearPassenger;
  }

  async ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.redirectTo = params.get('redirectTo');
    });

    this.photosTypes = await this.typeService.getByType('weekly_inspections');
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

  async onClearClick() {
    this.showErrors = false;
    this.inspectionForm.reset();
    this.inspection = {
      uuid: this.inspection.uuid,
      oil: null,
      brake: null,
      washer: null,
      jack: null,
      tread: null,
      spare_tire: null,
      tires_pressure_front_driver: null,
      tires_pressure_front_passenger: null,
      tires_pressure_rear_driver: null,
      tires_pressure_rear_passenger: null,
      card_in_vehicle: null,
      registration_in_vehicle: null
    };

    this.setVinAndOdometer();
  }

  async onSaveClick() {
    this.showErrors = false;
    const typeHasPhoto = await this.fileService.hasPhotos(
      'weekly_inspections',
      this.inspection.uuid,
      this.photosTypes.map(type => type.id)
    );

    if (this.inspectionForm.invalid ||
      this.inspection.registration_in_vehicle == null ||
      this.inspection.card_in_vehicle == null) {

      this.inspectionForm.markAllAsTouched();
      this.showErrors = true;

      return;
    }

    for (const value of Object.values(typeHasPhoto)) {
      if (!value) {
        this.showErrors = true;

        return this.showErrorToast('Please add all required photos.');
      }
    }

    this.inspection.vehicle_number = this.vehicleNumberCtrl.value;
    this.inspection.odometer_reading = this.odometerReadingCtrl.value;
    this.inspection.tires_pressure_front_driver = Number.parseInt(this.frontDriverCtrl.value, 10);
    this.inspection.tires_pressure_front_passenger = Number.parseInt(this.frontPassengerCtrl.value, 10);
    this.inspection.tires_pressure_rear_driver = Number.parseInt(this.rearDriverCtrl.value, 10);
    this.inspection.tires_pressure_rear_passenger = Number.parseInt(this.rearPassengerCtrl.value, 10);

    await this.vehicleInspectionsDatabase.createWeekly(this.inspection);
    this.vehicleInspectionService.setIsWeeklyInspectionRequired(false);

    if (
      !this.inspection.oil ||
      !this.inspection.brake ||
      !this.inspection.washer ||
      this.inspection.tires_pressure_front_driver < 25 ||
      this.inspection.tires_pressure_front_passenger < 25 ||
      this.inspection.tires_pressure_rear_driver < 25 ||
      this.inspection.tires_pressure_rear_passenger < 25
    ) {
      const alert = await this.alertController.create({
        header: 'Message Alert',
        message: 'Vehicle state is not good, fluids are low or the tires pressure isn\'t good!',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Ok',
            role: 'ok',
          },
        ]
      });

      await alert.present();

      await alert.onDidDismiss();
    }

    this.showErrors = false;

    if (this.redirectTo) {
      return this.router.navigateByUrl(this.redirectTo, {replaceUrl: true});
    } else {
      return this.router.navigateByUrl('/work-order/list', {replaceUrl: true});
    }
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

  onlyNumber(control: string, max = null) {
    const value = this.inspectionForm.controls[control].value;

    if(value) {
      if (value.search(/[^0-9]/) > -1) {
        this.inspectionForm.controls[control].setValue(value.replace(/[^0-9]/, ''));
      }

      if (max && this.inspectionForm.controls[control].value > max) {
        this.inspectionForm.controls[control].setValue(String(max));
      }
    }
  }
}
