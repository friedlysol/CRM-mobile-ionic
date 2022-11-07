import { Component, OnInit } from '@angular/core';
import { AssetInterface } from '@app/interfaces/asset.interface';
import { TypeService } from '@app/services/type.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService } from '@app/services/asset.service';

@Component({
  selector: 'app-asset-list',
  templateUrl: './asset-list.page.html',
  styleUrls: ['./asset-list.page.scss'],
})
export class AssetListPage implements OnInit {
  public addressUuid: string;
  public workOrderUuid: string;

  public assets: AssetInterface[] = [];
  public types: Record<number, string> = {};

  constructor(
    private activatedRoute: ActivatedRoute,
    private assetService: AssetService,
    private router: Router,
    private typeService: TypeService
  ) {
    this.activatedRoute.paramMap.subscribe(async params => {
      this.addressUuid = params.get('addressUuid');
      this.workOrderUuid = params.get('workOrderUuid');
    });
  }

  async ngOnInit() {
    this.types = await this.typeService.getByTypesAsValueList(this.assetService.getAssetTypeList());

    this.assets = this.assetService.getAssets();
  }

  getTypeValue(typeId: number) {
    if (this.types.hasOwnProperty(typeId)) {
      return this.types[typeId];
    }

    return '-';
  }

  async onAddClick() {
    return this.router.navigate(['/asset/form', this.workOrderUuid, this.addressUuid]);
  }

  goToAsset(assetUuid: string) {
    return this.router.navigate(['/asset/view', assetUuid]);
  }
}
