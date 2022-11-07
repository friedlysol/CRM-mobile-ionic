import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TypeService } from '@app/services/type.service';
import { TypeInterface } from '@app/interfaces/type.interface';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from '@app/services/database.service';
import { NavController } from '@ionic/angular';
import { AssetService } from '@app/services/asset.service';

@Component({
  selector: 'app-asset-form',
  templateUrl: './asset-form.page.html',
  styleUrls: ['./asset-form.page.scss'],
})
export class AssetFormPage implements OnInit {
  public form: FormGroup;

  public addressUuid: string;
  public assetUuid: string;
  public workOrderUuid: string;

  public manufacturers: any = [
    {label: 'MGM'},
    {label: 'Alside'},
    {label: 'Provia'},
  ];

  public types: Record<string, TypeInterface[]> = {};
  public otherTypes: Record<string, number> = {};
  public assetTypes: Record<number, string> = {};

  constructor(
    private activatedRoute: ActivatedRoute,
    private assetService: AssetService,
    private databaseService: DatabaseService,
    private navController: NavController,
    private router: Router,
    private typeService: TypeService
  ) {
    this.activatedRoute.paramMap.subscribe(async params => {
      this.addressUuid = params.get('addressUuid');
      this.assetUuid = params.get('assetUuid') || null;
      this.workOrderUuid = params.get('workOrderUuid');
    });
  }

  async ngOnInit() {
    const types = await this.typeService.getByTypes(this.assetService.getAssetTypeList());

    types.map(type => {
      if (!this.types.hasOwnProperty(type.type)) {
        this.types[type.type] = [];
      }

      this.types[type.type].push(type);

      if (type.type_key.indexOf('.other') > 0) {
        this.otherTypes[type.type_key] = type.id;
      }

      if (type.type === 'asset_type') {
        this.assetTypes[type.id] = type.type_key.split('.').pop();
      }
    })

    this.types['unit_number_type'] = [];
    for (let i = 1; i <= 50; i++) {
      this.types['unit_number_type'].push({id: i, type_value: String(i)})
    }
  }

  async ionViewWillEnter() {
    if (this.assetUuid) {

    } else {
      this.assetUuid = this.databaseService.getUuid();
    }

    this.initForm();
  }

  getTypes(type) {
    return this.types.hasOwnProperty(type) ? this.types[type] : [];
  }

  checkIsOtherSelected(sourceField, typeKey) {
    if (this.otherTypes.hasOwnProperty(typeKey)) {
      return this.form.get(sourceField).value === this.otherTypes[typeKey];
    }

    return false;
  }

  isSelectedType(...types) {
    const typeId = this.form.get('type_id').value
    const typeName = this.assetTypes.hasOwnProperty(typeId)
      ? this.assetTypes[typeId]
      : '';

    return types.includes(typeName);
  }

  private initForm() {
    const controls = {
      name: new FormControl(null),
      type_id: new FormControl(null),
      level_type_id: new FormControl(null),
      level_comment: new FormControl(null),
      exterior_side_type_id: new FormControl(null),
      exterior_side_comment: new FormControl(null),
      room_type_id: new FormControl(null),
      room_comment: new FormControl(null),
      unit_number: new FormControl(null),
      dimension_width: new FormControl(null),
      dimension_height: new FormControl(null),
      dimension_depth: new FormControl(null),
      replacement_type_id: new FormControl(null),
      material_type_id: new FormControl(null),
      material_color_type_id: new FormControl(null),
      grid_pattern_type_id: new FormControl(null),
      manufacturer: new FormControl(null),
      condition_type_id: new FormControl(null),
      floor_type_id: new FormControl(null),
      wall_material_type_id: new FormControl(null),
      existing_bath_wall_material_type_id: new FormControl(null),
      removal_of_material_type_id: new FormControl(null),
      condo_conditions_type_id: new FormControl(null),
      bath_door_type_id: new FormControl(null),
      dimension_bath_door_width: new FormControl(null),
      dimension_bath_door_height: new FormControl(null),
      bath_conditions_type_id: new FormControl(null),
      dimension_bath_hallway_width: new FormControl(null),
      comment: new FormControl(null),
    };

    this.form = new FormGroup(controls);
  }

  onCancelClick() {
    console.log('form', this.form.value);

    this.navController.back();
  }

  onSaveClick() {
    console.log('form', this.form.value);

    return this.router.navigate(['/asset/view', this.assetUuid], {replaceUrl: true});
  }
}
