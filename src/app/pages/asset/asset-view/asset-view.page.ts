import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService } from '@app/services/asset.service';
import { TypeService } from '@app/services/type.service';
import { AssetInterface } from '@app/interfaces/asset.interface';
import { TypeInterface } from '@app/interfaces/type.interface';
import { AlertController, ModalController } from '@ionic/angular';
import { GalleryModalComponent } from '@app/pages/gallery/gallery-modal/gallery-modal.component';
import { PartRequestComponent } from '@app/modals/part-request/part-request.component';
import { LaborRequestComponent } from '@app/modals/labor-request/labor-request.component';

@Component({
  selector: 'app-asset-view',
  templateUrl: './asset-view.page.html',
  styleUrls: ['./asset-view.page.scss'],
})
export class AssetViewPage implements OnInit {
  public asset: AssetInterface;
  public assetPictures: TypeInterface[] = [];
  public assetTypes: Record<number, string> = {};
  public assetUuid: string;
  public types: Record<number, string> = {};

  constructor(
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private assetService: AssetService,
    private modalController: ModalController,
    private router: Router,
    private typeService: TypeService
  ) {
    this.activatedRoute.paramMap.subscribe(async params => {
      this.assetUuid = params.get('assetUuid');
    });
  }

  async ngOnInit() {
    this.asset = this.assetService.getAssets().find(asset => asset.uuid === this.assetUuid);

    const types = await this.typeService.getByTypes(this.assetService.getAssetTypeList());

    types.map(type => {
      this.types[type.id] = type.type_value;

      if (type.type === 'asset_pictures') {
        this.assetPictures.push(type);
      }

      if (type.type === 'asset_type') {
        this.assetTypes[type.id] = type.type_key.split('.').pop();
      }
    })
  }

  getTypeValue(typeId: number) {
    if (this.types.hasOwnProperty(typeId)) {
      return this.types[typeId];
    }

    return '-';
  }

  isSelectedType(...types) {

    const typeName = this.assetTypes.hasOwnProperty(this.asset.type_id)
      ? this.assetTypes[this.asset.type_id]
      : '';

    return types.includes(typeName);
  }

  getDimensionAsString(dimension: any) {

    try {
      dimension = JSON.parse(dimension);

      let str = '';

      if(dimension.hasOwnProperty('width')) {
        str += dimension.width;
      }

      if(dimension.hasOwnProperty('height')) {
        str += ' x ' + dimension.height;
      }

      if(dimension.hasOwnProperty('depth')) {
        str += ' x ' + dimension.depth;
      }

      return str;
    } catch(err) {

    }

    return '-';
  }

  async onLaborRequestClick() {
    const modal = await this.modalController.create({
      component: LaborRequestComponent,
      componentProps: {
        objectType: 'asset',
        objectUuid: this.asset.uuid
      },
      cssClass: 'popup',
      backdropDismiss: false,

    });

    await modal.present();
  }

  async onPartRequestClick() {
    const modal = await this.modalController.create({
      component: PartRequestComponent,
      componentProps: {
        objectType: 'asset',
        objectUuid: this.asset.uuid,
        assetTypeId: this.asset.type_id
      },
      cssClass: 'popup',
      backdropDismiss: false,

    });

    await modal.present();
  }

  async onDeleteClick() {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you sure you want to delete this asset?',
      cssClass: 'form-alert',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Submit',
          role: 'submit',
          cssClass: 'alert-button-confirm',
        },
      ]
    });

    alert.present();

    alert.onDidDismiss().then((data) => {
      if (data.role === 'submit') {

      }
    });
  }
}
