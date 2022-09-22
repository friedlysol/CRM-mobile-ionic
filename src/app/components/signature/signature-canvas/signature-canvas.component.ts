import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

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
  currentLines: number[]
  drawing = false;

  constructor() { }

  ngAfterViewInit(): void {
    this.canvas = this.signaturePadElement.nativeElement;
    this.context = this.canvas.getContext('2d');

    const offset = window.screen.orientation.type === 'portrait-primary' ||
        window.screen.orientation.type === 'portrait-secondary'? 130: 90;
    this.canvas.width = window.screen.width;
    this.canvas.height = window.screen.height - offset;

    window.screen.orientation.onchange = () => {
      const data = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const offset = window.screen.orientation.type === 'portrait-primary' ||
        window.screen.orientation.type === 'portrait-secondary'? 130: 90;
      this.canvas.width = window.screen.width;
      this.canvas.height = window.screen.height - offset;
      this.context.putImageData(data, 0, 0)
    }
  }

  onTouchStart(e: TouchEvent){
    this.drawing = true;
    const canvasPosition = this.canvas.getBoundingClientRect();
    this.prevDrawing = {
      x: e.touches[0].pageX - canvasPosition.x,
      y: e.touches[0].pageY - canvasPosition.y,
    }
  }
  
  onTouchEnd(){
    this.drawing = false;
  }
  
  onTouchMove(e){
    if(!this.drawing) return;

    const canvasPosition = this.canvas.getBoundingClientRect();
    const current: ICoordinates = {
      x: e.touches[0].pageX - canvasPosition.x,
      y: e.touches[0].pageY - canvasPosition.y,
    }

    this.context.beginPath();
    this.context.moveTo(this.prevDrawing.x, this.prevDrawing.y);
    this.context.lineTo(current.x, current.y);
    this.context.closePath()

    this.context.lineWidth = 1;
    this.context.lineCap = 'round';
    this.context.strokeStyle = '#000';
    this.context.stroke();
    
    this.prevDrawing = current;
  }

  onCancelClick(){
    this.onCancel.emit();
  }

  onClear(){
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.prevDrawing = null;
  }

  onSaveClick(){
    this.onSave.emit(this.canvas.toDataURL());
  }

}
