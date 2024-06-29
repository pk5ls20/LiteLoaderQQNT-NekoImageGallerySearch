export const imageFileTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

interface UploadAddFileService {
  selectFiles: (multiple?: boolean, accept?: string[]) => Promise<File[]>;
  selectDirectory: (accept?: string[] | null) => Promise<File[]>;
}

// TODO: refactor this use file-type
export class devUploadAddFileService implements UploadAddFileService {
  selectFiles = (multiple: boolean = true, accept: string[] = imageFileTypes): Promise<File[]> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept.join(', ');
      input.multiple = multiple;
      input.onchange = () => {
        const files = input.files ? Array.from(input.files).filter((file) => accept.includes(file.type)) : [];
        if (files.length > 0) {
          resolve(files);
        } else {
          reject(new Error('No valid files selected.'));
        }
      };
      input.click();
    });
  };

  selectDirectory = (accept: string[] | null = imageFileTypes): Promise<File[]> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.accept = accept ? accept.join(', ') : '';
      input.onchange = () => {
        const files = input.files
          ? Array.from(input.files).filter((file) => accept === null || accept.includes(file.type))
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
}

export class LLNTUploadAddFileService implements UploadAddFileService {
  selectFiles = (multiple: boolean = true, accept: string[] = imageFileTypes): Promise<File[]> => {
    return window.imageSearch.selectFiles(multiple, accept);
  };

  selectDirectory = (accept: string[] | null = imageFileTypes): Promise<File[]> => {
    return window.imageSearch.selectDirectory(accept);
  };
}
