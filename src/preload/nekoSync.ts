import { ipcRenderer } from 'electron';
import { type MimeType } from 'file-type';
import * as channel from '../common/channels';
import { ImgObject } from '../common/imgObject';
import { log } from '../common/share/logs';
import { TriggerImageRegisterName } from '../common/share/triggerImageRegisterName';
import { convertImgObject } from './fs';

let hasPostAppImageResRegistered = false;
const postAppImageCallBackDict = new Map<
  number,
  (file_content: Uint8Array | null, file_mine: MimeType) => Promise<void>
>();

export const postAppImageReq = (file_content: Blob | null, registerNum: TriggerImageRegisterName): void => {
  if (file_content instanceof Blob) {
    file_content.arrayBuffer().then((buffer) => {
      ipcRenderer.send(channel.POST_APP_IMAGE_SEARCH_REQ, Buffer.from(buffer), registerNum);
    });
  } else {
    ipcRenderer.send(channel.POST_APP_IMAGE_SEARCH_REQ, file_content, registerNum);
  }
};

export const postAppImageRes = (
  callback: (file_content: Uint8Array | null, file_mine: MimeType) => Promise<void>,
  registerNum: TriggerImageRegisterName
): void => {
  postAppImageCallBackDict.set(registerNum, callback);
  log.debug('postAppImageRes: Registering callback for registerNum:', registerNum);
  if (hasPostAppImageResRegistered) {
    return;
  }
  hasPostAppImageResRegistered = true;
  ipcRenderer.on(
    channel.POST_APP_IMAGE_SEARCH_RES,
    async (event, response: Uint8Array | null, mine_type: MimeType, registerNum: number) => {
      try {
        log.debug('postAppImageSearchRes: Received image search response:', response, registerNum);
        const callback = postAppImageCallBackDict.get(registerNum);
        if (callback && response) {
          log.debug('postAppImageSearchRes: Found callback for the registerNum:', registerNum);
          await callback(response, mine_type);
        } else {
          log.error(
            'postAppImageSearchRes: No callback or No content found for the registerNum:',
            registerNum,
            response
          );
        }
      } catch (error) {
        log.error('postAppImageSearchRes await callback: Error processing image search response:', error);
      }
    }
  );
};

export const addUploadFileReq = async (imgList: ImgObject[]): Promise<void> => {
  try {
    ipcRenderer.send(channel.ADD_UPLOAD_FILE_REQ, imgList);
  } catch (error) {
    log.error('Error adding upload file:', error);
  }
};

export const addUploadFileRes = (callback: (file: File[]) => void): void => {
  ipcRenderer.on(channel.ADD_UPLOAD_FILE_RES, async (_, imgList: ImgObject[]) => {
    try {
      const fileList = await convertImgObject(imgList);
      callback(fileList);
    } catch (error) {
      log.error('Error processing uploaded file:', error);
    }
  });
};
