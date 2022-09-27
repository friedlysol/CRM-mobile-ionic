import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

export interface ISignatureFromData{
  ownerName: string;
  ownerTitle: string;
}

@Component({
  selector: 'app-signature-form',
  templateUrl: './signature-form.component.html',
  styleUrls: ['./signature-form.component.scss'],
})
export class SignatureFormComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() next = new EventEmitter<ISignatureFromData>();

  ownerName = new FormControl('', [Validators.required]);
  ownerTitle = new FormControl('', [Validators.required]);

  constructor() { }

  onCancelClick(){
    this.cancel.emit();
  }

  onNextClick(){
    if(this.ownerName.invalid || this.ownerTitle.invalid) {
      this.ownerName.markAsTouched();
      this.ownerTitle.markAsTouched();
      return;
    }

    this.next.emit({
      ownerName: this.ownerName.value,
      ownerTitle: this.ownerTitle.value,
    });
  }

}
