import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

export interface ISignatureFromData{
  ownerName: string,
  ownerTitle: string,
}

@Component({
  selector: 'signature-form',
  templateUrl: './signature-form.component.html',
  styleUrls: ['./signature-form.component.scss'],
})
export class SignatureFormComponent {
  @Output() onCancel = new EventEmitter<void>();
  @Output() onNext = new EventEmitter<ISignatureFromData>();

  ownerName = new FormControl('', [Validators.required]);
  ownerTitle = new FormControl('', [Validators.required]);

  constructor() { }

  onCancelClick(){
    this.onCancel.emit();
  }

  onNextClick(){
    if(this.ownerName.invalid || this.ownerTitle.invalid) {
      this.ownerName.markAsTouched();
      this.ownerTitle.markAsTouched();
      return;
    }

    this.onNext.emit({
      ownerName: this.ownerName.value,
      ownerTitle: this.ownerTitle.value,
    })
  }

}
