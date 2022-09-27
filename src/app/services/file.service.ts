import { Injectable } from '@angular/core';
import { FileDatabase } from '@app/services/database/file.database';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileInterface } from '@app/interfaces/file.interface';
import { PrevNextInterface } from '@app/interfaces/prev-next.interface';
import { environment } from '@env/environment';
import { AuthService } from '@app/services/auth.service';

declare let FileTransferManager: any;

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private uploader: any;

  constructor(private authService: AuthService, private fileDatabase: FileDatabase) {

  }

  backgroundUploadInit(): void {
    console.log('Background uploader init');

    this.uploader = FileTransferManager.init({
      parallelUploadsLimit: 2,
      notificationTitle: 'Upload service',
      notificationContent: 'Background upload service running'
    }, async event => {
      console.log('uploader - FileTransferManager EVENT', event);

      const file: FileInterface = await this.fileDatabase.getByUuid(event.id);
      if (!file) {
        return;
      }

      file.sync_bg_status = event.state;

      if (event.state === 'UPLOADED') {
        try {
          const response = JSON.parse(event.serverResponse);

          console.log('uploader response: ', response);

          if (response.data) {
            file.id = response.data.object_id;
            file.sync = 1;
          }
        } catch (err) {
          console.error('uploader - serverResponse', err);
        }
      }

      await this.fileDatabase.update(file, file.uuid);

      if (event.eventId) {
        this.uploader.acknowledgeEvent(event.eventId);
      }
    });
  }

  cancelUpload(file: FileInterface): void {
    this.uploader.removeUpload(file.uuid, res => {
      file.sync_bg_status = null;

      return this.fileDatabase.update(file, file.uuid);
    }, err => console.log('Error removing upload'));
  }

  /**
   * Added file to the synchronization queue
   *
   * @param file
   */
  async uploadFile(file: FileInterface) {
    const uploadData = {
      id: file.uuid,
      filePath: file.path,
      fileKey: 'file',
      serverUrl: environment.apiEndpoint + '/mobile/v2/files/sync',
      notificationTitle: 'Uploading file',
      headers: {
        authorization: 'Bearer ' + this.authService.getToken()
      },
      parameters: {
        uuid: file.uuid,
        id: file.id || '',
        object_type: file.object_type,
        object_uuid: file.object_uuid,
        object_id: file.object_id || 0,
        type: file.type,
        type_id: file.type_id || '',
        link_person_wo_id: file.link_person_wo_id || '',
        filename: file.path.split(/(\\|\/)/g).pop(),
        description: file.description || '',
        gps_location: file.gps_coords || '',
        crc: file.crc || '',
        created_at: file.created_at
      }
    };

    try {
      this.uploader.startUpload(uploadData);

      file.sync_bg_status = 'QUEUED';

      console.log('File added to queue: ', uploadData);

      return this.fileDatabase.update(file, file.uuid);
    } catch (err) {

      return file;
    }
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

  async getPrevNextByUuid(uuid): Promise<PrevNextInterface> {
    const prevNext = await this.fileDatabase.getPrevNextByUuid(uuid);

    if (prevNext) {
      return prevNext;
    }

    return {
      prev: null,
      next: null
    };
  }

  async saveFile(filePath: string, file: FileInterface): Promise<FileInterface> {
    file.path = filePath;

    return this.fileDatabase.create(file)
      .then(createdFile => this.uploadFile(createdFile));
  };

  async saveBase64File(fileBase64: string, fileName: string, file: FileInterface): Promise<FileInterface> {
    file.path = await this.createFileAndGetUrl(fileBase64, fileName);

    return this.fileDatabase.create(file)
      .then(createdFile => this.uploadFile(createdFile));
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

  private createCanvas(width: number, height: number) {
    const canvas = <HTMLCanvasElement>document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
}
