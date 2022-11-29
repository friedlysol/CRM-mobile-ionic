import { Component, OnDestroy, OnInit } from '@angular/core';
import { WorkOrderService } from '@app/services/workorder.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkOrderInterface } from '@app/interfaces/work-order.interface';
import { AddressService } from '@app/services/address.service';
import { WorkOrderDatabase } from '@app/services/database/workorder.database';
import { TypeService } from '@app/services/type.service';
import { TypeInterface } from '@app/interfaces/type.interface';
import { AddressInterface } from '@app/interfaces/address.interface';
import { AddressDatabase } from '@app/services/database/address.database';
import { LaunchNavigator } from '@awesome-cordova-plugins/launch-navigator/ngx';
import { StaticService } from '@app/services/static.service';
import { TechStatusDatabase } from '@app/services/database/tech-status.database';
import { TechStatusInterface } from '@app/interfaces/tech-status.interface';
import { TimeSheetsDatabase } from '@app/services/database/time-sheets.database';
import { TimeSheetService } from '@app/services/time-sheet.service';
import { TimeSheetInterface } from '@app/interfaces/time-sheet.interface';
import { UtilsService } from '@app/services/utils.service';

import { environment } from '@env/environment';
import { VehicleInspectionService } from '@app/services/vehicle-inspection.service';
import { PartRequestComponent } from '@app/modals/part-request/part-request.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-work-order-view',
  templateUrl: './work-order-view.page.html',
  styleUrls: ['./work-order-view.page.scss'],
})
export class WorkOrderViewPage implements OnInit, OnDestroy {
  public workOrder: WorkOrderInterface;
  public woTypes: TypeInterface[] = [];
  public woAddress: AddressInterface;
  public exteriorTypes: TypeInterface[] = [];
  public structureTypes: TypeInterface[] = [];
  public foundationTypes: TypeInterface[] = [];
  public conditionsTypes: TypeInterface[] = [];
  public coveredAreaTypes: TypeInterface[] = [];
  public photoType: TypeInterface;

  private currentTechStatus: TechStatusInterface = null;
  private workOrderUuid: string;

  constructor(
    private addressDatabase: AddressDatabase,
    private launchNavigator: LaunchNavigator,
    private activatedRoute: ActivatedRoute,
    private modalController: ModalController,
    private router: Router,
    private staticService: StaticService,
    private techStatusDatabase: TechStatusDatabase,
    private timeSheetDatabase: TimeSheetsDatabase,
    private timeSheetService: TimeSheetService,
    private typeService: TypeService,
    private vehicleInspectionService: VehicleInspectionService,
    private workOrderDatabase: WorkOrderDatabase,
    private workOrderService: WorkOrderService,
    public addressService: AddressService,
    public utilsService: UtilsService,
  ) {
  }

  async ngOnInit() {
    this.activatedRoute.paramMap.subscribe(async params => {
      this.workOrderUuid = params.get('workOrderUuid');

      this.workOrder = await this.workOrderDatabase.getByUuid(this.workOrderUuid);
      this.woAddress = await this.addressDatabase.getByUuid(this.workOrder.address_uuid);

      this.currentTechStatus = await this.techStatusDatabase.getTechStatusById(this.workOrder.tech_status_type_id);
    });

    this.woTypes = await this.typeService.getByType('tech_status');
    this.exteriorTypes = await this.typeService.getByType('wo_exterior_type');
    this.structureTypes = await this.typeService.getByType('wo_structure_type');
    this.foundationTypes = await this.typeService.getByType('wo_foundation_type');
    this.conditionsTypes = await this.typeService.getByType('wo_conditions_type');
    this.coveredAreaTypes = await this.typeService.getByType('wo_covered_area_type');
    this.photoType = await this.typeService.getByKey('wo_pictures.photo');
  }

  async ionViewDidEnter() {
    const redirectTo = encodeURI('/work-order/view/' + this.workOrderUuid);

    if (await this.vehicleInspectionService.checkIfDailyInspectionIsRequired()) {
      return this.router.navigateByUrl('/vehicle-inspection/daily?redirectTo=' + redirectTo);
    }

    if (await this.vehicleInspectionService.checkIfWeeklyInspectionIsRequired()) {
      return this.router.navigateByUrl('/vehicle-inspection/weekly?redirectTo=' + redirectTo);
    }
  }

  ngOnDestroy() {
  }

  isWorking() {
    if (!this.workOrder || !this.woTypes) {
      return false;
    }
    return this.workOrder.tech_status_type_id === this.woTypes.find(e => e.type_key === 'tech_status.work_in_progress')?.id;
  }

  isCompleted() {
    if (!this.workOrder || !this.woTypes) {
      return false;
    }
    return this.workOrder.tech_status_type_id === this.woTypes.find(e => e.type_key === 'tech_status.completed')?.id;
  }

  updateWorkOrder() {
    this.workOrderDatabase.update(this.workOrder.uuid, this.workOrder);
  }

  getLocationQueryString() {
    if (!this.woAddress) {
      return '';
    }
    return (this.woAddress.address ? this.woAddress.address + ', ' : '') +
      (this.woAddress.city ? this.woAddress.city + ', ' : '') +
      (this.woAddress.state ? this.woAddress.state + ', ' : '');
  }

  getMapLink() {
    if (this.staticService.isIos) {
      return 'maps://?q=' + this.getLocationQueryString();
    } else {
      return 'geo:0,0?q=' + this.getLocationQueryString();
    }
  }

  navigateToMap() {
    this.launchNavigator.navigate(this.getLocationQueryString());
  }

  isDisabledSelectStatusOption(index: number) {
    if (this.woTypes[index].type_key === 'tech_status.incomplete') {
      return !(this.woTypes[index].id === this.workOrder.tech_status_type_id);
    }

    return !(this.woTypes[index].id === this.workOrder.tech_status_type_id ||
      index > 0 && this.woTypes[index - 1].id === this.workOrder.tech_status_type_id ||
      index < this.woTypes.length - 1 && this.woTypes[index + 1].id === this.workOrder.tech_status_type_id);
  }

  showConfirmButton() {
    return this.workOrder.status === environment.workOrderStatuses.issued;
  };

  async onPartRequestClick() {
    console.log('asd');
    const modal = await this.modalController.create({
      component: PartRequestComponent,
      componentProps: {
        objectType: 'work_order',
        objectUuid: this.workOrder.uuid
      },
      cssClass: 'popup',
      backdropDismiss: false,

    });

    await modal.present();
  }

  async changeStatus() {
    // abort checking if the newly selected status is the same as the current one
    if (this.currentTechStatus.id === this.workOrder.tech_status_type_id) {
      return;
    }

    // validation of all work order data before changing status to completed
    // if something is missing an exception is thrown
    if (this.workOrder.tech_status_type_id === environment.techStatuses.completed) {
      const isValid = await this.workOrderService.workOrderDataValidation(this.workOrder);
      if(!isValid) {
        return this.revertStatus();
      }
    }

    // before changing the status we check if there is any other work order active
    // if so we do not allow to change the status and throw an exception
    const activeAnotherWorkOrder = await this.workOrderService.checkIfAnotherWorkOrderIsActive(this.workOrder);
    if(activeAnotherWorkOrder) {
      return this.revertStatus();
    }

    // confirmation of change of status
    const changeStatus = await this.workOrderService.confirmToChangeStatus();
    if(!changeStatus) {
      return this.revertStatus();
    }

    if(this.workOrder.tech_status_type_id === environment.techStatuses.completed) {
      await this.workOrderService.changeStatusToComplete(this.workOrder);
    } else {
      const lastTimeSheet = await this.timeSheetDatabase.getLastTimeSheetForWorkOrderUuid(this.workOrder.uuid);

      if(lastTimeSheet && !lastTimeSheet.stop_at) {
        const description = await this.timeSheetService.getDescription(this.currentTechStatus);

        await this.timeSheetService.stop(lastTimeSheet, {description});
      }

      const newTechStatus = await this.techStatusDatabase.getTechStatusById(this.workOrder.tech_status_type_id);

      if(newTechStatus.start_after_stop) {
        const canStartTimeSheet = await this.workOrderService.checkIfCanStartAnotherTimesheet(this.workOrder);

        if(canStartTimeSheet) {
          const techStatus = await this.techStatusDatabase.getTechStatusById(this.workOrder.tech_status_type_id);

          const timeSheet: TimeSheetInterface = {
            type_id: techStatus.time_sheet_reason_type_id,
            object_type: 'work_order',
            object_uuid: this.workOrder.uuid,
            work_order_number: this.workOrder.work_order_number
          };

          await this.timeSheetService.start(timeSheet);
        } else {
          this.revertStatus();
        }
      }
    }

    this.currentTechStatus = await this.workOrderService.setNewTechStatus(this.workOrder, this.currentTechStatus);

    await this.workOrderService.sync({sync_only_from_app: 1});
  }

  async confirmWorkOrder(workOrder: WorkOrderInterface) {
    workOrder.status = await this.workOrderService.changeStatusToConfirmed(workOrder);
  }

  private revertStatus() {
    console.log('this.currentTechStatus', this.currentTechStatus);

    this.workOrder.tech_status_type_id = this.currentTechStatus.id;

    return;
  }

}
