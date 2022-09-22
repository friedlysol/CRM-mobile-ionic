import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { GestureController } from '@ionic/angular';

interface ICoordinates{
  x :number,
  y: number,
}

@Component({
  selector: 'signature-canvas',
  templateUrl: './signature-canvas.component.html',
  styleUrls: ['./signature-canvas.component.scss'],
})
export class SignatureCanvasComponent implements AfterViewInit {
  @ViewChild('canvasElement') signaturePadElement: ElementRef<HTMLCanvasElement>;

  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<string>();
  
  context: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  prevDrawing: ICoordinates;

  constructor(
    private gestureCtrl: GestureController,
  ) { }

  ngAfterViewInit(): void {
    this.canvas = this.signaturePadElement.nativeElement;
    this.context = this.canvas.getContext('2d');
    
    this.canvas.width = window.innerWidth;
    this.canvas.height = 550;
    
    this.gestureCtrl.create({
      el: this.canvas,
      gestureName: 'drawing',
      onMove: e => {
        const rect = this.canvas.getBoundingClientRect();
        this.drawOnCanvas({x: e.currentX - rect.left, y: e.currentY - rect.top})
      },
      onEnd: () => this.prevDrawing = null,
    }, true).enable()

  }

  onCancelClick(){
    this.onCancel.emit();
  }

  onClear(){
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.prevDrawing = null;
  }

  onSaveClick(){
    this.onSave.emit(this.canvas.toDataURL('image/jpeg'));
  }

  drawOnCanvas(current: ICoordinates){
    if(!this.context) return;

    this.context.beginPath();
    if(this.prevDrawing){
      this.context.moveTo(this.prevDrawing.x, this.prevDrawing.y);
      this.context.lineTo(current.x, current.y);
      this.context.lineWidth = 1;
      this.context.lineCap = 'round';
      this.context.strokeStyle = '#000';
      this.context.stroke();
    }
    this.prevDrawing = current;
  }

}
