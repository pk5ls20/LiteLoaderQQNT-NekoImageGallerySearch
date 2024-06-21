import { log } from '../common/logs';

const { contextBridge, ipcRenderer } = require('electron');

const imageSearch = {
  getSettings: () => ipcRenderer.invoke('LiteLoader.imageSearch.getSettings'),

  setSettings: async (content: any) => {
    try {
      const response = await ipcRenderer.invoke('LiteLoader.imageSearch.setSettings', content);
      ipcRenderer.send('LiteLoader.imageSearch.triggerSettingReq', response);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  },

  logToMain: (...args: any) => ipcRenderer.invoke('LiteLoader.imageSearch.logToMain', ...args),

  getLocalFileAsBlob: async (filePath: string) => {
    try {
      const buffer = await ipcRenderer.invoke('LiteLoader.imageSearch.getLocalFile', filePath);
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
        ipcRenderer.send('LiteLoader.imageSearch.postAppImageSearchReq', Buffer.from(buffer));
      });
    } else {
      ipcRenderer.send('LiteLoader.imageSearch.postAppImageSearchReq', file_content);
    }
  },

  postAppImageSearchRes(callback: (file_content: Buffer | null) => Promise<void>): void {
    ipcRenderer.on('LiteLoader.imageSearch.imageSearchResponse', async (event, response) => {
      try {
        await callback(response);
      } catch (error) {
        log.error('postAppImageSearchRes: Error processing image search response:', error);
      }
    });
  },

  TriggerSetting(callback: (setting: string) => Promise<void>): void {
    ipcRenderer.on('LiteLoader.imageSearch.triggerSettingResponse', async (event, response) => {
      try {
        await callback(response);
        log.debug('Callback successfully executed');
      } catch (error) {
        log.error('TriggerSetting: Error processing image search response:', error);
      }
    });
  },

  openWeb: (url: string) => ipcRenderer.send('LiteLoader.imageSearch.openWeb', url)
};

contextBridge.exposeInMainWorld('imageSearch', imageSearch);
