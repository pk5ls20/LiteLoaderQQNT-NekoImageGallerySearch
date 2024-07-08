import { contextBridge, ipcRenderer } from 'electron';
import { type MimeType } from 'file-type';
import * as channel from '../common/channels';
import { FileObject } from '../common/fileObject';
import { log } from '../common/share/logs';
import { pluginSettingsModel } from '../common/share/PluginSettingsModel';
import { TriggerImageRegisterName } from '../common/share/triggerImageRegisterName';
import { type forwardMsgData } from '../renderer/NTQQMsgModel';

const handleSelectFile = async (fileList: FileObject[]): Promise<File[]> => {
  return await Promise.all(
    fileList.map(async (file: FileObject) => {
      const mine = await ipcRenderer.invoke(channel.CALCULATE_FILE_TYPE, file.content);
      const blob = new Blob([file.content], { type: mine });
      return new File([blob], file.name, {
        type: mine
      });
    })
  );
};

let hasPostAppImageResRegistered = false;
const postAppImageCallBackDict = new Map<
  number,
  (file_content: Uint8Array | null, file_mine: MimeType) => Promise<void>
>();

const imageSearch = {
  async getSettings(): Promise<pluginSettingsModel | null> {
    try {
      return await ipcRenderer.invoke(channel.GET_SETTING);
    } catch (error) {
      log.error('Error retrieving settings:', error);
      return null;
    }
  },

  async setSettings(content: pluginSettingsModel): Promise<void> {
    try {
      const response = await ipcRenderer.invoke(channel.SET_SETTING, content);
      ipcRenderer.send(channel.TRIGGER_SETTING_REQ, response);
    } catch (error) {
      log.error('Error updating settings:', error);
    }
  },

  async getLocalFileAsUInt8Array(filePath: string): Promise<Uint8Array | null> {
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
  },

  postAppImageReq(file_content: Blob | null, registerNum: TriggerImageRegisterName): void {
    if (file_content instanceof Blob) {
      file_content.arrayBuffer().then((buffer) => {
        ipcRenderer.send(channel.POST_APP_IMAGE_SEARCH_REQ, Buffer.from(buffer), registerNum);
      });
    } else {
      ipcRenderer.send(channel.POST_APP_IMAGE_SEARCH_REQ, file_content, registerNum);
    }
  },

  postAppImageRes(
    callback: (file_content: Uint8Array | null, file_mine: MimeType) => Promise<void>,
    registerNum: TriggerImageRegisterName
  ): void {
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
  },

  triggerSettingReq(setting: string | null): void {
    ipcRenderer.send(channel.TRIGGER_SETTING_REQ, setting);
  },

  triggerSettingRes(callback: (setting: string | null) => Promise<void>): void {
    ipcRenderer.on(channel.TRIGGER_SETTING_RES, async (event, response) => {
      try {
        await callback(response);
        log.debug('Callback successfully executed');
      } catch (error) {
        log.error('TriggerSetting await callback: Error processing image search response:', error);
      }
    });
  },

  async selectFiles(multiple: boolean, accept: MimeType[]): Promise<File[]> {
    try {
      const filesInfo: FileObject[] = await ipcRenderer.invoke(channel.SELECT_FILE, multiple, accept);
      return handleSelectFile(filesInfo);
    } catch (error) {
      log.error('Failed to select files:', error);
      throw new Error('Failed to select files');
    }
  },

  async selectDirectory(accept: MimeType[] | null): Promise<File[]> {
    try {
      const filesInfo: FileObject[] = await ipcRenderer.invoke(channel.SELECT_FOLDER, accept);
      return handleSelectFile(filesInfo);
    } catch (error) {
      console.error('Failed to select directory:', error);
      throw new Error('Failed to select directory');
    }
  },

  async getForwardMsgContent(data: forwardMsgData): Promise<string[] | null> {
    try {
      return await ipcRenderer.invoke(channel.GET_FORWARD_MSG_CONTENT, data);
    } catch (error) {
      log.error('Error retrieving forward message content:', error);
      return null;
    }
  },

  openWeb(url: string): void {
    ipcRenderer.send(channel.OPEN_WEB, url);
  }
};

contextBridge.exposeInMainWorld(channel.API_KEY, imageSearch);
