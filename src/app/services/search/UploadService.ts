// reference https://github.com/hv0905/NekoImageGallery.App/blob/master/src/Services/UploadService.ts
import { isAxiosError } from 'axios';
import { ErrorProtocol } from '../../models/search/ApiResponse';
import { UploadTask, UploadTaskStatus } from '../../models/search/UploadTaskModel';
import { uploadImage } from './AdminApi';

export class UploadService {
  constructor(
    public queue: UploadTask[],
    public workersCount = 4,
    public statusUpdateCallback?: () => void
  ) {}

  public get finishedTasksCount(): number {
    return this.completedTasksCount + this.errorTasksCount + this.duplicateTasksCount;
  }

  public get completedTasksCount(): number {
    return this.queue.filter((t) => t.status === UploadTaskStatus.Complete).length;
  }

  public get errorTasksCount(): number {
    return this.queue.filter((t) => t.status === UploadTaskStatus.Error).length;
  }

  public get duplicateTasksCount(): number {
    return this.queue.filter((t) => t.status === UploadTaskStatus.Duplicate).length;
  }

  public upload(): Promise<void[]> {
    const threadColl = [];
    for (let i = 0; i < this.workersCount; ++i) {
      threadColl.push(this.uploadWorker());
    }
    return Promise.all(threadColl);
  }

  private async uploadWorker() {
    for (const item of this.queue) {
      if (item.status != UploadTaskStatus.Pending) {
        continue;
      }
      item.status = UploadTaskStatus.Uploading;
      this.statusUpdateCallback?.();
      try {
        await uploadImage(item.file, true, item.starred, item.skipOcr, item.categories);
        item.status = UploadTaskStatus.Complete;
      } catch (err) {
        if (isAxiosError<ErrorProtocol>(err)) {
          if (!err.response) {
            item.status = UploadTaskStatus.Error;
            item.errorText = 'Network error';
          } else if (err.response.status === 409) {
            item.status = UploadTaskStatus.Duplicate;
            item.errorText = 'Duplicated';
          } else if (err.response.status === 400 || err.response.status === 415) {
            item.status = UploadTaskStatus.Error;
            item.errorText = 'Invalid file';
          } else {
            item.status = UploadTaskStatus.Error;
            item.errorText = err.response?.data?.detail ?? 'Unknown error';
          }
        } else {
          item.status = UploadTaskStatus.Error;
          item.errorText = 'Internal error';
        }
      } finally {
        this.statusUpdateCallback?.();
      }
    }
  }
}
