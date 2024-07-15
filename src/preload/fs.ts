import { ipcRenderer } from 'electron';
import { type MimeType } from 'file-type';
import * as channel from '../common/channels';
import { log } from '../common/share/logs';
import { ImgObject } from '../common/imgObject';

export const convertImgObject = async (fileList: ImgObject[]): Promise<File[]> => {
  return await Promise.all(
    fileList.map(async (file: ImgObject) => {
      const mine = await ipcRenderer.invoke(channel.CALCULATE_FILE_TYPE, file.content);
      const blob = new Blob([file.content], { type: mine });
      return new File([blob], file.name, {
        type: mine
      });
    })
  );
};

export const getLocalFileAsUInt8Array = async (filePath: string): Promise<Uint8Array | null> => {
  try {
    const buffer = await ipcRenderer.invoke(channel.GET_LOCAL_FILE, filePath);
    if (buffer) {
      return new Uint8Array(buffer);
    } else {
      log.error('getLocalFileAsBlob: No data received for the file');
      return null;
    }
  } catch (error) {
    log.error('getLocalFileAsBlob: Error when communicating with the main process', error);
    return null;
  }
};

export const selectFiles = async (multiple: boolean, accept: MimeType[]): Promise<File[]> => {
  try {
    const imgList: ImgObject[] = await ipcRenderer.invoke(channel.SELECT_FILE, multiple, accept);
    return convertImgObject(imgList);
  } catch (error) {
    log.error('Failed to select files:', error);
    throw new Error('Failed to select files');
  }
};

export const selectDirectory = async (accept: MimeType[] | null): Promise<File[]> => {
  try {
    const imgList: ImgObject[] = await ipcRenderer.invoke(channel.SELECT_FOLDER, accept);
    return convertImgObject(imgList);
  } catch (error) {
    console.error('Failed to select directory:', error);
    throw new Error('Failed to select directory');
  }
};
