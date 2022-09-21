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

  async getLastByObjectAndType(objectType: string, objectUuid: string, typeId: number): Promise<FileInterface | null> {
    const files = await this.fileDatabase.getByObjectAndType(objectType, objectUuid, typeId);

    if (files.length) {
      return files.pop();
    }

    return null;
  }

  async saveBase64File(fileBase64: string, fileName: string, file: FileInterface): Promise<FileInterface> {
    const writeFile = await Filesystem.writeFile({
      path: fileName,
      data: fileBase64,
      directory: Directory.Data,
    });

    file.path = writeFile.uri;

    return this.fileDatabase.create(file);
  };
}
