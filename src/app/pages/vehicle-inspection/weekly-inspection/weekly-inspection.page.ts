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

  formGroup = new FormGroup({
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
    return this.formGroup.controls.vehicleNumber;
  }

  get odometerReadingCtrl() {
    return this.formGroup.controls.odometerReading;
  }

  get frontDriverCtrl() {
    return this.formGroup.controls.frontDriver;
  }

  get rearDriverCtrl() {
    return this.formGroup.controls.rearDriver;
  }

  get frontPassengerCtrl() {
    return this.formGroup.controls.frontPassenger;
  }

  get rearPassengerCtrl() {
    return this.formGroup.controls.rearPassenger;
  }

  async ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.redirectTo = params.get('redirectTo');
    });

    this.photosTypes = await this.typeService.getByType('weekly_inspections');
  }

  async onClearClick() {
    this.showErrors = false;
    this.formGroup.reset();
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
  }

  async onSaveClick() {
    this.showErrors = false;
    const typeHasPhoto = await this.fileService.hasPhotos(
      'weekly_inspections',
      this.inspection.uuid,
      this.photosTypes.map(type => type.id)
    );

    if (this.formGroup.invalid ||
      this.inspection.registration_in_vehicle == null ||
      this.inspection.card_in_vehicle == null) {

      this.formGroup.markAllAsTouched();
      this.showErrors = true;

      return;
    }

    for (const value of Object.values(typeHasPhoto)) {
      if (!value) {
        this.showErrorToast('Please add all required photos.');
        this.showErrors = true;

        return;
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

    if (!this.inspection.oil || !this.inspection.brake || !this.inspection.washer ||
      this.inspection.tires_pressure_front_driver <= 32 || this.inspection.tires_pressure_front_passenger <= 32 ||
      this.inspection.tires_pressure_rear_driver <= 38 || this.inspection.tires_pressure_rear_passenger <= 38
    ) {
      const alert = await this.alertController.create({
        header: 'Message Alert',
        message: 'Vehicle state is not good!\nPlease contact your manager!',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Ok',
            role: 'ok',
          },
        ]
      });

      alert.present();

      await alert.onDidDismiss();
    }

    this.showErrors = false;

    if (this.redirectTo) {
      this.router.navigateByUrl(this.redirectTo, {replaceUrl: true});
    } else {
      this.router.navigateByUrl('/work-order/list', {replaceUrl: true});
    }
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
