import { Injectable } from '@angular/core';
import { FileDatabase } from '@app/services/database/file.database';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileInterface } from '@app/interfaces/file.interface';
import { PrevNextInterface } from '@app/interfaces/prev-next.interface';
import { environment } from '@env/environment';
import { AuthService } from '@app/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

declare let FileTransferManager: any;

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private uploader: any;

  constructor(
    private authService: AuthService,
    private fileDatabase: FileDatabase,
    private http: HttpClient,
  ) {
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
          if (file.type === 'database') {
            await this.fileDatabase.remove(file);
          } else {
            const response = JSON.parse(event.serverResponse);

            console.log('Uploader response: ', response);

            file.id = response.data.object_id;
            file.sync = 1;

            await this.fileDatabase.updateSyncBgStatus(file, file.uuid);
          }
        } catch (err) {
          console.error('uploader - serverResponse', err);
        }
      }

      if (event.eventId) {
        this.uploader.acknowledgeEvent(event.eventId);
      }
    });
  }

  cancelUpload(file: FileInterface): void {
    this.uploader.removeUpload(file.uuid, res => {
      file.sync_bg_status = null;

      return this.fileDatabase.updateSyncBgStatus(file, file.uuid);
    }, err => console.log('Error removing upload'));
  }

  async uploadDatabase(path: string) {
    const file = await this.fileDatabase.create({
      type: 'database',
      object_type: 'database',
      object_uuid: 'database',
      object_id: null,
      sync: 1,
      path
    } as FileInterface);

    const uploadData = {
      id: file.uuid,
      filePath: file.path,
      fileKey: 'file',
      serverUrl: `${environment.apiEndpoint}mobile/debug/db`,
      notificationTitle: 'Uploading file',
      headers: {
        authorization: 'Bearer ' + this.authService.getToken()
      },
    };

    try {
      this.uploader.startUpload(uploadData);

      file.sync_bg_status = 'QUEUED';

      console.log('File added to queue: ', uploadData);

      return this.fileDatabase.updateSyncBgStatus(file, file.uuid);
    } catch (err) {
      console.error('startUpload', err, uploadData);

      return file;
    }
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
      serverUrl: environment.apiEndpoint + 'mobile/v2/files/sync',
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

      return this.fileDatabase.updateSyncBgStatus(file, file.uuid);
    } catch (err) {

      return file;
    }
  }

  downloadFile(file: FileInterface) {
    return this.http.get(
      file.path,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob'
      }
    ).pipe(
      tap(async data => {
        if (data.type === 2) {
          file.download_attempts++;
        }
        if (data.type === 4) {
          file.path = await this.createFileAndGetUrl(
            await data.body.text(),
            new Date().getTime().toString(),
          );

          file.thumbnail = await this.createFileAndGetUrl(
            await this.generateThumbnail(URL.createObjectURL(data.body)),
            new Date().getTime().toString(),
          );

          this.fileDatabase.updateFile(file);
        }
      }),
    );
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
    page: number = 1,
    pageSize: number = null,
    onlyFilesWithExt: string = null,
    onlyToDownload: boolean = false,
  ): Promise<FileInterface[]> {

    let files = [];
    if (pageSize) {
      files = await this.fileDatabase.getByObjectAndTypeWithPagination(
        objectType,
        objectUuid,
        page,
        pageSize,
      );
    } else {
      files = await this.fileDatabase.getByObjectAndType(objectType, objectUuid);
    }

    if (onlyFilesWithExt) {
      const regex = new RegExp(`\.${onlyFilesWithExt}$`);
      files = files.filter(file => regex.test(file.path));
    }

    if (onlyToDownload) {
      const regex = new RegExp('^https?');
      files = files.filter(file => regex.test(file.path));
    }

    return files;
  }

  async getTotalByObjectAndType(
    objectType: string,
    objectUuid: string,
    typeId: number = null,
    linkPersonWoId: number = null,
  ): Promise<number> {
    const files = await this.fileDatabase.getByObjectAndType(objectType, objectUuid, typeId, linkPersonWoId);

    return files.length;
  }

  async getTotalByObjectAndTypeSkipPdf(
    objectType: string,
    objectUuid: string,
  ): Promise<number> {
    const files = await this.fileDatabase.getByObjectAndTypeSkipPdf(objectType, objectUuid);

    return files.length;
  }

  async getByUuid(uuid: string): Promise<FileInterface | null> {
    return this.fileDatabase.getByUuid(uuid);
  }

  async getPrevAndNextByUuid(uuid: string): Promise<PrevNextInterface | null> {
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

    return this.fileDatabase.updateFile(file);
  }

  async createFileAndGetUrl(fileBase64: string, fileName: string): Promise<string> {
    const writeFile = await Filesystem.writeFile({
      path: fileName,
      data: fileBase64,
      directory: Directory.Documents,
    });

    return writeFile.uri;
  }

  async removeFile(file: FileInterface) {
    if (file.sync === 1 || file.sync_bg_status != null) {
      file.is_deleted = 1;
      file.sync = 0;

      return this.fileDatabase.updateFile(file);
    }else if(file.sync === 0 && file.sync_bg_status == null){
      return this.fileDatabase.remove(file);
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

  generateThumbnail(source: string, width: number = 300, height: number = 300): Promise<string> {
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
    const canvas = document.createElement('canvas') as HTMLCanvasElement;

    canvas.width = width;
    canvas.height = height;

    return canvas;
  }
}
