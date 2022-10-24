import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkOrderInterface } from '@app/interfaces/work-order.interface';
import { AddressService } from '@app/services/address.service';
import { WorkOrderDatabase } from '@app/services/database/workorder.database';
import { TypeService } from '@app/services/type.service';
import { TypeInterface } from '@app/interfaces/type.interface';
import { AddressInterface } from '@app/interfaces/address.interface';
import { AddressDatabase } from '@app/services/database/address.database';
import { LaunchNavigator } from '@awesome-cordova-plugins/launch-navigator/ngx';
import { StaticService } from '@app/services/static.service';
import { UtilsService } from '@app/services/utils.service';

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

  private workOrderUuid: string;

  constructor(
    private addressDatabase: AddressDatabase,
    private launchNavigator: LaunchNavigator,
    private route: ActivatedRoute,
    private staticService: StaticService,
    private typeService: TypeService,
    private workOrderDatabase: WorkOrderDatabase,
    public addressService: AddressService,
    public utilsService: UtilsService,
  ) {
  }

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      this.workOrderUuid = params.get('workOrderUuid');
      this.workOrder = await this.workOrderDatabase.getByUuid(this.workOrderUuid);
      this.woAddress = await this.addressDatabase.getByUuid(this.workOrder.address_uuid);
    });

    this.woTypes = await this.typeService.getByType('tech_status');
    this.exteriorTypes = await this.typeService.getByType('wo_exterior_type');
    this.structureTypes = await this.typeService.getByType('wo_structure_type');
    this.foundationTypes = await this.typeService.getByType('wo_foundation_type');
    this.conditionsTypes = await this.typeService.getByType('wo_conditions_type');
    this.coveredAreaTypes = await this.typeService.getByType('wo_covered_area_type');
    this.photoType = await this.typeService.getByKey('wo_pictures.photo');
  }

  ngOnDestroy() {
  }

  isWorking() {
    if (!this.workOrder || !this.woTypes) {
      return false;
    }
    return this.workOrder.tech_status_type_id === this.woTypes.find(e => e.type_key=== 'tech_status.work_in_progress')?.id;
  }

  isCompleted(){
    if(!this.workOrder || !this.woTypes){
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
    if(this.staticService.isIos) {
      return 'maps://?q=' + this.getLocationQueryString();
    } else {
      return 'geo:0,0?q=' + this.getLocationQueryString();
    }
  }

  navigateToMap() {
    this.launchNavigator.navigate(this.getLocationQueryString());
  }

  isDisabledSelectStatusOption(index: number){
    if(this.woTypes[index].type_key === 'tech_status.incomplete'){
      return !(this.woTypes[index].id === this.workOrder.tech_status_type_id);
    }

    return !(this.woTypes[index].id === this.workOrder.tech_status_type_id ||
      index > 0 && this.woTypes[index-1].id === this.workOrder.tech_status_type_id ||
      index < this.woTypes.length-1 && this.woTypes[index+1].id === this.workOrder.tech_status_type_id);
  }
}
