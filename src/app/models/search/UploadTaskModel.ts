// reference https://github.com/hv0905/NekoImageGallery.App/blob/master/src/Models/UploadTaskModel.ts
export enum UploadTaskStatus {
  Pending = 'pending',
  Uploading = 'uploading',
  Complete = 'complete',
  Error = 'error',
  Duplicate = 'duplicate'
}

export class UploadTask {
  private static counter = 0;
  public errorText = '';
  public readonly id: number;

  constructor(
    public file: File,
    public progress = 0,
    public status: UploadTaskStatus = UploadTaskStatus.Pending,
    public categories = '',
    public starred = false,
    public selected = false,
    public skipOcr = false
  ) {
    this.id = UploadTask.counter++;
  }
}
