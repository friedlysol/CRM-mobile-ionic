import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '@app/services/database.service';
import { BillService } from '@app/services/bill.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { BillEntryInterface } from '@app/interfaces/bill-entry.interface';
import { BillDatabase } from '@app/services/database/bill.database';
import { TypeService } from '@app/services/type.service';
import { TypeInterface } from '@app/interfaces/type.interface';

@Component({
  selector: 'app-bill-form',
  templateUrl: './bill-form.page.html',
  styleUrls: ['./bill-form.page.scss'],
})
export class BillFormPage implements OnInit {
  public form: FormGroup;
  public billEntryUuid: string;

  public otherDescription: TypeInterface;
  public photoType: TypeInterface;
  public types: Record<string, TypeInterface[]> = {};

  public billEntry: BillEntryInterface;

  constructor(
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private billDatabase: BillDatabase,
    private billService: BillService,
    private databaseService: DatabaseService,
    private navController: NavController,
    private router: Router,
    private toastController: ToastController,
    private typeService: TypeService
  ) {
    this.activatedRoute.paramMap.subscribe(async params => {
      this.billEntryUuid = params.get('billEntryUuid');
    });
  }

  async ngOnInit() {
    this.photoType = await this.typeService.getByKey('bill_entry.receipt');
    this.otherDescription = await this.typeService.getByKey('bill_description_type.other');
  }

  async ionViewWillEnter() {
    if (this.billEntryUuid) {
      this.billEntry = await this.billDatabase.getByUuid(this.billEntryUuid);
    } else {
      this.billEntryUuid = this.databaseService.getUuid();
    }

    const types = await this.typeService.getByTypes(['bill_description_type', 'bill_status_type']);

    types.map(type => {
      if (!this.types.hasOwnProperty(type.type)) {
        this.types[type.type] = [];
      }

      this.types[type.type].push(type);
    });

    this.initForm();
  }

  getTypes(type) {
    return this.types.hasOwnProperty(type) ? this.types[type] : [];
  }

  checkIsOtherSelected() {
    if(this.otherDescription) {
      return this.form.get('desc').value === this.otherDescription.id;
    }

    return false;
  }

  get desc() {
    return this.form.get('desc');
  }

  get price() {
    return this.form.get('price');
  }

  get supplierName() {
    return this.form.get('supplier_name');
  }

  get reimbursement() {
    return this.form.get('reimbursement');
  }

  get comment() {
    return this.form.get('comment');
  }

  private initForm() {
    let desc = null;
    let comment = null;

    if(this.billEntry?.desc) {
      const type = this.getTypes('bill_description_type').find(type => type.type_value === this.billEntry.desc);

      if(type) {
        desc = type.id;
      } else {
        desc = this.otherDescription.id;
        comment = this.billEntry?.desc;
      }
    }

    const controls = {
      desc: new FormControl(desc),
      price: new FormControl(this.billEntry?.price || null, [Validators.required]),
      supplier_name: new FormControl(this.billEntry?.supplier_name || null),
      reimbursement: new FormControl(this.billEntry?.reimbursement || null),
      comment: new FormControl(comment),
    };

    this.form = new FormGroup(controls);
  }

  onCancelClick() {
    this.navController.back();
  }

  async onDeleteClick() {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you sure you want to delete this bill?',
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

    await alert.present();

    alert.onDidDismiss().then(async (data) => {
      if (data.role === 'submit') {
        await this.billDatabase.remove(this.billEntryUuid);

        this.navController.back();
      }
    });
  }

  async onSaveClick() {
    if(!await this.billDatabase.hasUnitPhotos(this.billEntryUuid)) {
      const toast = await this.toastController.create({
        message: 'Please add required photo.',
        duration: 3000,
        position: 'top',
      });

      await toast.present();
    } else {
      if (this.form.invalid) {
        this.form.markAllAsTouched();

        return;
      }

      let description = null;
      if(this.desc.getRawValue()) {
        const type = this.getTypes('bill_description_type').find(type => type.id === this.desc.getRawValue());
        if(type) {
          description = type.type_value;
        }

        if(this.desc.getRawValue() === this.otherDescription.id) {
          const comment = this.comment.getRawValue();
          if (comment) {
            description = comment;
          }
        }
      }

      const statusType = await this.typeService.getByKey('bill_status_type.waiting_for_approval');

      const billEntry: BillEntryInterface = {
        uuid: this.billEntryUuid,
        desc: description,
        supplier_name: this.supplierName.getRawValue(),
        price: this.price.getRawValue(),
        total: this.price.getRawValue(),
        reimbursement: this.reimbursement.getRawValue() ? 1 : 0,
        bill_status_type_id: statusType ? statusType.id : null,
        type_id: this.photoType.id,
        qty: 1
      }

      if(this.billEntry) {
        billEntry.qty = 1;
        billEntry.tax_amount = null;

        await this.billDatabase.update(billEntry);
      } else {
        await this.billDatabase.create(billEntry);
      }

      this.navController.back();
    }
  }
}
