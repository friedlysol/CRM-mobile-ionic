import { Injectable } from '@angular/core';
import { FileDatabase } from '@app/services/database/file.database';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileInterface } from '@app/interfaces/file.interface';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(
    private fileDatabase: FileDatabase,
  ) {

  }

  async getLastByObjectAndType(
    objectType: string,
    objectUuid: string,
    typeId: number,
    linkPersonWoId: number = null
  ): Promise<FileInterface | null> {
    const files = await this.fileDatabase.getByObjectAndType(objectType, objectUuid, typeId, linkPersonWoId);

    if (files.length) {
      return files.pop();
    }

    return null;
  }

  async getTotalByObjectAndType(
    objectType: string,
    objectUuid: string,
    typeId: number,
    linkPersonWoId: number = null
  ): Promise<number> {
    const files = await this.fileDatabase.getByObjectAndType(objectType, objectUuid, typeId, linkPersonWoId);

    return files.length;
  }

  async saveFile(filePath: string, file: FileInterface): Promise<FileInterface> {
    file.path = filePath;

    return this.fileDatabase.create(file);
  };

  async saveBase64File(fileBase64: string, fileName: string, file: FileInterface): Promise<FileInterface> {
    const writeFile = await Filesystem.writeFile({
      path: fileName,
      data: fileBase64,
      directory: Directory.Data,
    });

    file.path = writeFile.uri;

    return this.fileDatabase.create(file);
  };

  convertToGrayScale(source: string): Promise<string>{
    const image = new Image();
    image.src = source;
    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = this.createCanvas(image.width, image.height)
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, image.width, image.height);
        let imgPixels = ctx.getImageData(0, 0, image.width, image.height);
        for(let y = 0; y < imgPixels.height; y++){
          for(let x = 0; x < imgPixels.width; x++){
            let i = (y * 4) * imgPixels.width + x * 4;
            let avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
            
            imgPixels.data[i] = avg;
            imgPixels.data[i + 1] = avg;
            imgPixels.data[i + 2] = avg;
          }
        }
        
        ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
        resolve(canvas.toDataURL());
      }
    })
  }

  generateThumnail(){

  }

  private createCanvas(width: number, height: number){
    const canvas = <HTMLCanvasElement>document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
}
