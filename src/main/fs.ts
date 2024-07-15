import { dialog, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileTypeFromBuffer, MimeType } from 'file-type';
import * as channel from '../common/channels';
import { log } from '../common/share/logs';
import { ImgObject } from '../common/imgObject';

const readDirectory = async (localPath: string[], allow_mine: MimeType[]): Promise<ImgObject[]> => {
  log.debug(`allow_mine= ${allow_mine}`);
  const filePromises: Promise<ImgObject[]>[] = [];
  for (const singlePath of localPath) {
    const stats = await fs.promises.stat(singlePath);
    if (stats.isDirectory()) {
      const entries = await fs.promises.readdir(singlePath, { withFileTypes: true });
      const dirPaths = entries.map((entry: fs.Dirent) => path.join(singlePath, entry.name));
      filePromises.push(readDirectory(dirPaths, allow_mine));
    } else {
      const content = await fs.promises.readFile(singlePath);
      const type = await fileTypeFromBuffer(content);
      if (type?.mime && allow_mine.includes(type?.mime)) {
        filePromises.push(
          Promise.resolve([
            new ImgObject(
              path.basename(singlePath),
              path.extname(singlePath).substring(1),
              new Uint8Array(content).buffer,
              singlePath
            )
          ])
        );
      } else {
        log.debug('File type not allowed:', JSON.stringify(type), singlePath, allow_mine);
      }
    }
  }
  const filesArrays = await Promise.all(filePromises);
  return filesArrays.flat();
};

const handleOpenDialog = async (result: Electron.OpenDialogReturnValue, accept: MimeType[]): Promise<ImgObject[]> => {
  if (result.canceled) {
    log.debug('No directory selected');
    return Promise.reject(new Error('No directory selected'));
  } else {
    log.debug('Selected directory:', JSON.stringify(result.filePaths));
    return await readDirectory(result.filePaths, accept);
  }
};

ipcMain.handle(channel.CALCULATE_FILE_TYPE, async (_, file_content: Uint8Array): Promise<MimeType> => {
  const res = await fileTypeFromBuffer(file_content);
  return res?.mime ?? 'image/png';
});

ipcMain.handle(channel.GET_LOCAL_FILE, (_, file_path: string): Buffer | null => {
  try {
    return fs.readFileSync(file_path);
  } catch (error) {
    log.error('Error occurred in ipcMain.handle channel.GET_LOCAL_FILE', error);
    return null;
  }
});

ipcMain.handle(channel.SELECT_FILE, async (_, multiple: boolean, accept: MimeType[]): Promise<ImgObject[]> => {
  const result = await dialog.showOpenDialog({
    properties: multiple ? ['openFile', 'multiSelections'] : ['openFile']
  });
  return handleOpenDialog(result, accept);
});

ipcMain.handle(channel.SELECT_FOLDER, async (_, accept: MimeType[]): Promise<ImgObject[]> => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'multiSelections']
  });
  return handleOpenDialog(result, accept);
});
