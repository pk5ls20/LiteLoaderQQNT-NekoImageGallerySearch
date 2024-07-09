import { type MimeType } from 'file-type';
import { sharedAdapter } from '../../adapter/SharedAdapter';

export const imageFileTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as MimeType[];

interface UploadAddFileService {
  selectFiles: (multiple?: boolean, accept?: MimeType[]) => Promise<File[]>;
  selectDirectory: (accept?: MimeType[] | null) => Promise<File[]>;
  addUploadFileListener: (callback: (file: File[]) => void) => void;
}

export class devUploadAddFileService implements UploadAddFileService {
  selectFiles = (multiple: boolean = true, accept: MimeType[] = imageFileTypes): Promise<File[]> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept.join(', ');
      input.multiple = multiple;
      input.onchange = () => {
        const files = input.files
          ? Array.from(input.files).filter((file) => accept.includes(file.type as MimeType))
          : [];
        if (files.length > 0) {
          resolve(files);
        } else {
          reject(new Error('No valid files selected.'));
        }
      };
      input.click();
    });
  };

  selectDirectory = (accept: MimeType[] | null = imageFileTypes): Promise<File[]> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.accept = accept ? accept.join(', ') : '';
      input.onchange = () => {
        const files = input.files
          ? Array.from(input.files).filter((file) => accept === null || accept.includes(file.type as MimeType))
          : [];
        if (files.length > 0) {
          resolve(files);
        } else {
          reject(new Error('No valid files selected.'));
        }
      };
      input.click();
    });
  };

  addUploadFileListener(callback: (file: File[]) => void): void {
    sharedAdapter.Log.debug('devUploadAddFileService addUploadFileListener');
  }
}

export class LLNTUploadAddFileService implements UploadAddFileService {
  selectFiles = (multiple: boolean = true, accept: MimeType[] = imageFileTypes): Promise<File[]> => {
    return window.imageSearch.selectFiles(multiple, accept);
  };

  selectDirectory = (accept: MimeType[] | null = imageFileTypes): Promise<File[]> => {
    return window.imageSearch.selectDirectory(accept);
  };

  addUploadFileListener = (callback: (file: File[]) => void): void => {
    window.imageSearch.addUploadFileRes(callback);
  };
}
