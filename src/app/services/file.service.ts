import { Injectable } from '@angular/core';
import { FileDatabase } from '@app/services/database/file.database';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileInterface } from '@app/interfaces/file.interface';
import { PrevNextInterface } from '@app/interfaces/prev-next.interface';

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

  async getArrayByObjectAndType(
    objectType: string,
    objectUuid: string,
    typeId: number,
    page: number = 1,
    pageSize: number = null,
    linkPersonWoId: number = null
  ): Promise<FileInterface[]> {

    if(pageSize){
      return await this.fileDatabase.getByObjectAndTypeWithPagination(
        objectType,
        objectUuid,
        typeId,
        page,
        pageSize,
      );
    }
    return await this.fileDatabase.getByObjectAndType(objectType, objectUuid, typeId, linkPersonWoId);
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

  async getByUuid(
    uuid: string,
  ): Promise<FileInterface | null>{
    return this.fileDatabase.getByUuid(uuid);
  }

  async getPrevAndNextByUuid(
    uuid: string,
  ): Promise<PrevNextInterface | null>{
    return this.fileDatabase.getPrevNextByUuid(uuid);
  }

  async saveFile(filePath: string, file: FileInterface): Promise<FileInterface> {
    file.path = filePath;

    return this.fileDatabase.create(file);
  };

  async saveBase64File(fileBase64: string, fileName: string, file: FileInterface): Promise<FileInterface> {
    file.path = await this.createFileAndGetUrl(fileBase64, fileName);

    return this.fileDatabase.create(file);
  };

  async saveBase64Thumbnail(fileBase64: string, file: FileInterface) {
    file.thumbnail = await this.createFileAndGetUrl(fileBase64, file.uuid + '_thumbnail.jpg');

    return this.fileDatabase.updateThumbnail(file);
  }

  async createFileAndGetUrl(fileBase64: string, fileName: string): Promise<string> {
    const writeFile = await Filesystem.writeFile({
      path: fileName,
      data: fileBase64,
      directory: Directory.Data,
    });

    return writeFile.uri;
  }

  async removeFile(file: FileInterface) {
    if (file.sync === 1) {
      if (file.path.search(/file:/) === 0) {
        try {
          await Filesystem.deleteFile({path: file.path});
        } catch (err) {
        }

        if (file.thumbnail) {
          try {
            await Filesystem.deleteFile({path: file.thumbnail});
          } catch (err) {
          }
        }
      }

      return this.fileDatabase.remove(file.uuid);
    }

    return Promise.resolve(false);
  }

  convertToGrayScale(source: string): Promise<string> {
    const image = new Image();
    image.src = source;
    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = this.createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const imgPixels = ctx.getImageData(0, 0, image.width, image.height);
        for (let y = 0; y < imgPixels.height; y++) {
          for (let x = 0; x < imgPixels.width; x++) {
            const i = (y * 4) * imgPixels.width + x * 4;
            const avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;

            imgPixels.data[i] = avg;
            imgPixels.data[i + 1] = avg;
            imgPixels.data[i + 2] = avg;
          }
        }

        ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
        resolve(canvas.toDataURL('image/jpeg'));
      };
    });
  }

  generateThumnail(source: string, width: number = 300, height: number = 300): Promise<string> {
    const image = new Image();
    image.src = source;
    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = this.createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg'));
      };
    });
  }

  private createCanvas(width: number, height: number){
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
}
