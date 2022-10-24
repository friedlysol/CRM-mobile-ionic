import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TypeInterface } from '@app/interfaces/type.interface';
import { WeeklyInspectionInterface } from '@app/interfaces/weekly-inspection.interface';
import { VehicleInspectionsDatabase } from '@app/services/database/vehicle-inspection.database';
import { FileService } from '@app/services/file.service';
import { TypeService } from '@app/services/type.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-weekly-inspection',
  templateUrl: './weekly-inspection.page.html',
  styleUrls: ['./weekly-inspection.page.scss'],
})
export class WeeklyInspectionPage implements OnInit {
  redirectTo: string;

  photosTypes: TypeInterface[] = [];
  inspection: WeeklyInspectionInterface;

  formGroup = new FormGroup({
    vehicleNumber: new FormControl('', [Validators.required]),
    odometerReading: new FormControl('', [Validators.required]),
    frontDriver: new FormControl('', [Validators.required]),
    rearDriver: new FormControl('', [Validators.required]),
    frontPassenger: new FormControl('', [Validators.required]),
    rearPassenger: new FormControl('', [Validators.required]),
  });

  constructor(
    private alertController: AlertController,
    private fileService: FileService,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private typeService: TypeService,
    private vehicleInspectionsDatabase: VehicleInspectionsDatabase,
  ) { }

  get vehicleNumberCtrl(){
    return this.formGroup.controls.vehicleNumber;
  }
  get odometerReadingCtrl(){
    return this.formGroup.controls.odometerReading;
  }
  get frontDriverCtrl(){
    return this.formGroup.controls.frontDriver;
  }
  get rearDriverCtrl(){
    return this.formGroup.controls.rearDriver;
  }
  get frontPassengerCtrl(){
    return this.formGroup.controls.frontPassenger;
  }
  get rearPassengerCtrl(){
    return this.formGroup.controls.rearPassenger;
  }

  async ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.redirectTo = params.get('redirectTo');
    });

    this.photosTypes = await this.typeService.getByType('weekly_inspections');
    console.log(this.photosTypes);
    this.inspection = await this.vehicleInspectionsDatabase.createWeekly();
    console.log(this.inspection)
  }

  async onClearClick(){
    this.formGroup.reset();
    this.inspection = await this.vehicleInspectionsDatabase.getWeeklyByUuid(this.inspection.uuid);
  }

  async onSaveClick(){
    const typeHasPhoto = await this.fileService.hasPhotos(
      'weekly_inspections',
      this.inspection.uuid,
      this.photosTypes.map(type => type.id)
    );
    if(this.formGroup.invalid){
      this.formGroup.markAllAsTouched();
      return;
    }
    for(const value of Object.values(typeHasPhoto)){
      if(!value){
        this.showErrorToast('Please take all required photos.');
        return;
      }
    }
    this.inspection.vehicle_number = this.vehicleNumberCtrl.value;
    this.inspection.odometer_reading = this.odometerReadingCtrl.value;
    this.inspection.tires_pressure_front_driver = this.frontDriverCtrl.value? 1: 0;
    this.inspection.tires_pressure_front_passenger = this.frontPassengerCtrl.value? 1: 0;
    this.inspection.tires_pressure_rear_driver = this.rearDriverCtrl.value? 1: 0;
    this.inspection.tires_pressure_rear_passenger = this.rearPassengerCtrl.value? 1: 0;
    console.log(this.inspection)

    if(this.redirectTo){
      this.router.navigateByUrl(this.redirectTo, {replaceUrl: true});
    }else{
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
