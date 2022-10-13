import { Component, OnDestroy, OnInit } from '@angular/core';
import { WorkOrderService } from '@app/services/workorder.service';
import { ActivatedRoute } from '@angular/router';
import { WorkOrderInterface } from '@app/interfaces/work-order.interface';
import { AddressService } from '@app/services/address.service';
import { WorkOrderDatabase } from '@app/services/database/workorder.database';
import { TypeService } from '@app/services/type.service';
import { TypeInterface } from '@app/interfaces/type.interface';
import { AddressInterface } from '@app/interfaces/address.interface';
import { AddressDatabase } from '@app/services/database/address.database';
import { LaunchNavigator, LaunchNavigatorOptions } from '@awesome-cordova-plugins/launch-navigator/ngx';

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
    private typeService: TypeService,
    private workOrderDatabase: WorkOrderDatabase,
    private workOrderService: WorkOrderService,
    public addressService: AddressService
  ) {
  }

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      this.workOrderUuid = params.get('workOrderUuid');
      this.workOrder = await this.workOrderDatabase.getByUuid(this.workOrderUuid);
      console.log(this.workOrder);

      this.woAddress = await this.addressDatabase.getByUuid(this.workOrder.address_uuid);
      console.log(this.woAddress)
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

  isWorking(){
    if(!this.workOrder || !this.woTypes){
      return false;
    }
    return this.workOrder.tech_status_type_id === this.woTypes.find(e => e.type_value === 'WIP')?.id;
  }

  updateWorkOrder(){
    this.workOrderDatabase.update(this.workOrder.uuid, this.workOrder);
  }

  getLocationQueryString(){
    if(!this.woAddress){
      return '';
    }
    return (this.woAddress.address? this.woAddress.address + ', ': '')+
    (this.woAddress.city? this.woAddress.city + ', ': '')+
    (this.woAddress.state? this.woAddress.state + ', ': '');
  }

  navigateToMap(){
    this.launchNavigator.navigate(this.getLocationQueryString());
  }
}
