import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';

interface ICoordinates{
  x: number;
  y: number;
}

@Component({
  selector: 'app-signature-canvas',
  templateUrl: './signature-canvas.component.html',
  styleUrls: ['./signature-canvas.component.scss'],
})
export class SignatureCanvasComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('canvasElement') signaturePadElement: ElementRef<HTMLCanvasElement>;

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<string>();

  context: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  prevDrawing: ICoordinates;
  currentLines: number[];
  drawing = false;

  constructor() { }

  ngOnInit(): void {
    window.screen.orientation.lock('landscape');
  }

  ngAfterViewInit(): void {
    this.canvas = this.signaturePadElement.nativeElement;
    this.context = this.canvas.getContext('2d');
    if(window.screen.orientation.type === 'portrait-primary' ||
      window.screen.orientation.type === 'portrait-secondary'){
      this.canvas.height = window.screen.width - 90;
      this.canvas.width = window.screen.height;
    }else{
      this.canvas.height = window.screen.height - 90;
      this.canvas.width = window.screen.width;
    }
  }

  ngOnDestroy(): void {
    window.screen.orientation.unlock();
  }


  onTouchStart(e: TouchEvent){
    this.drawing = true;
    const canvasPosition = this.canvas.getBoundingClientRect();
    this.prevDrawing = {
      x: e.touches[0].pageX - canvasPosition.x,
      y: e.touches[0].pageY - canvasPosition.y,
    };
  }

  onTouchEnd(){
    this.drawing = false;
  }

  onTouchMove(e){
    if(!this.drawing) {
      return;
    }

    const canvasPosition = this.canvas.getBoundingClientRect();
    const current: ICoordinates = {
      x: e.touches[0].pageX - canvasPosition.x,
      y: e.touches[0].pageY - canvasPosition.y,
    };

    this.context.beginPath();
    this.context.moveTo(this.prevDrawing.x, this.prevDrawing.y);
    this.context.lineTo(current.x, current.y);
    this.context.closePath();

    this.context.lineWidth = 1;
    this.context.lineCap = 'round';
    this.context.strokeStyle = '#000';
    this.context.stroke();

    this.prevDrawing = current;
  }

  onCancelClick(){
    this.cancel.emit();
    window.screen.orientation.unlock();
  }

  onClear(){
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.prevDrawing = null;
  }

  onSaveClick(){
    this.save.emit(this.canvas.toDataURL());
    window.screen.orientation.unlock();
  }

}
