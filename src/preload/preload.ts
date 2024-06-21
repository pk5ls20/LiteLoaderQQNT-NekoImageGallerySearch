import { log } from '../common/logs';
import * as channel from '../common/channels';

const { contextBridge, ipcRenderer } = require('electron');

const imageSearch = {
  getSettings: () => ipcRenderer.invoke(channel.GET_SETTING),

  setSettings: async (content: any) => {
    try {
      const response = await ipcRenderer.invoke(channel.SET_SETTING, content);
      ipcRenderer.send(channel.TRIGGER_SETTING_REQ, response);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  },

  getLocalFileAsBlob: async (filePath: string) => {
    try {
      const buffer = await ipcRenderer.invoke(channel.GET_LOCAL_FILE, filePath);
      if (buffer) {
        return new Blob([buffer], { type: 'image/png' });
      } else {
        log.error('getLocalFileAsBlob: Error when loading file');
        return null;
      }
    } catch (error) {
      log.error('getLocalFileAsBlob: Error when sending to main', error);
      return null;
    }
  },

  postAppImageSearchReq: (file_content: Blob | null) => {
    if (file_content instanceof Blob) {
      file_content.arrayBuffer().then((buffer) => {
        ipcRenderer.send(channel.POST_APP_IMAGE_SEARCH_REQ, Buffer.from(buffer));
      });
    } else {
      ipcRenderer.send(channel.POST_APP_IMAGE_SEARCH_REQ, file_content);
    }
  },

  postAppImageSearchRes(callback: (file_content: Buffer | null) => Promise<void>): void {
    ipcRenderer.on(channel.POST_APP_IMAGE_SEARCH_RES, async (event, response) => {
      try {
        await callback(response);
      } catch (error) {
        log.error('postAppImageSearchRes await callback: Error processing image search response:', error);
      }
    });
  },

  TriggerSetting(callback: (setting: string) => Promise<void>): void {
    ipcRenderer.on(channel.TRIGGER_SETTING_RES, async (event, response) => {
      try {
        await callback(response);
        log.debug('Callback successfully executed');
      } catch (error) {
        log.error('TriggerSetting await callback: Error processing image search response:', error);
      }
    });
  },

  openWeb: (url: string) => ipcRenderer.send(channel.OPEN_WEB, url)
};

contextBridge.exposeInMainWorld(channel.API_KEY, imageSearch);
