import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';
import { AssetInterface } from '@app/interfaces/asset.interface';
import { WorkOrderInterface } from '@app/interfaces/work-order.interface';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  syncTitle = 'assets';

  private workOrder: WorkOrderInterface = null;

  constructor(
    private databaseService: DatabaseService
  ) {
    this.databaseService
      .findOrNull(`select * from work_orders where id = 1`)
      .then(workOrder => this.workOrder = workOrder);
  }

  getAssets(): AssetInterface[] {
    return [
      {
        uuid: '1',
        work_order_uuid: this.workOrder?.uuid,
        status_type_id: 1478,
        bath_conditions_type_id: null,
        bath_door_type_id: null,
        comment: null,
        condition_type_id: 1681,
        condo_conditions_type_id: null,
        dimension_bath_door_height: null,
        dimension_bath_door_width: null,
        dimension_bath_hallway_width: null,
        dimension: JSON.stringify({
          depth: "8",
          height: "8",
          width: "6",
        }),
        existing_bath_wall_material_type_id: null,
        exterior_side_comment: null,
        exterior_side_type_id: 1548,
        floor_type_id: null,
        grid_pattern_type_id: 1680,
        level_comment: null,
        level_type_id: 1542,
        manufacturer: "Alside",
        material_color_type_id: 1565,
        material_type_id: 1563,
        name: "Test window",
        removal_of_material_type_id: null,
        replacement_type_id: 1558,
        room_comment: null,
        room_type_id: 1552,
        type_id: 1723,
        unit_number: 1,
        wall_material_type_id: null,
        total_photos: 0
      },
      {
        uuid: '2',
        work_order_uuid: this.workOrder?.uuid,
        status_type_id: 1478,
        bath_conditions_type_id: null,
        bath_door_type_id: null,
        comment: null,
        condo_conditions_type_id: null,
        existing_bath_wall_material_type_id: null,
        exterior_side_comment: null,
        exterior_side_type_id: 1547,
        floor_type_id: null,
        grid_pattern_type_id: 1680,
        level_comment: null,
        level_type_id: 1544,
        manufacturer: "Provia",
        material_color_type_id: 1566,
        material_type_id: null,
        name: "Test - door",
        removal_of_material_type_id: null,
        replacement_type_id: 1558,
        room_comment: null,
        room_type_id: 1550,
        type_id: 1724,
        unit_number: 1,
        wall_material_type_id: null,
        total_photos: 0
      },
      {
        uuid: '3',
        work_order_uuid: this.workOrder?.uuid,
        status_type_id: 1478,
        bath_conditions_type_id: 1719,
        bath_door_type_id: 1711,
        comment: null,
        condo_conditions_type_id: 1708,
        existing_bath_wall_material_type_id: 1695,
        exterior_side_comment: null,
        exterior_side_type_id: null,
        floor_type_id: 1683,
        grid_pattern_type_id: null,
        level_comment: null,
        level_type_id: 1541,
        manufacturer: null,
        material_color_type_id: null,
        material_type_id: null,
        name: "Test bath",
        removal_of_material_type_id: 1700,
        replacement_type_id: null,
        room_comment: null,
        room_type_id: 1552,
        type_id: 1725,
        unit_number: 1,
        wall_material_type_id: 1689,
        total_photos: 0
      }
    ];
  }

  getAssetTypeList() {
    return [
      'asset_bath_door_type',
      'asset_condo_conditions_type',
      'asset_existing_bath_wall_material_type',
      'asset_exterior_side_type',
      'asset_floor_type',
      'asset_grid_pattern_type',
      'asset_level_type',
      'asset_material_colors_type',
      'asset_materials_type',
      'asset_pictures',
      'asset_removal_of_material_type',
      'asset_replacement_type',
      'asset_room_type',
      'asset_status',
      'asset_type',
      'asset_wall_material_type',
      'asset_window_condition_type',
    ];
  }
}
