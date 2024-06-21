/// <reference path="../global.d.ts" />
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ipcMain, shell, BrowserWindow } from 'electron';
import * as channel from '../common/channels';
import { log } from '../common/logs';

const pluginDataPath = LiteLoader.plugins['image_search'].path.data;
const settingsPath = path.join(pluginDataPath, 'settings.json');

if (!fs.existsSync(pluginDataPath)) {
  log.debug('Plugin data path not found, creating new plugin data path');
  fs.mkdirSync(pluginDataPath, { recursive: true });
}
if (!fs.existsSync(settingsPath)) {
  log.debug('Settings file not found, creating new settings file');
  fs.writeFileSync(
    settingsPath,
    JSON.stringify({
      nekoimage_api: '',
      nekoimage_access_token: '',
      nekoimage_admin_token: ''
    })
  );
}

// ipcMain handle
ipcMain.handle(channel.GET_SETTING, (event, message) => {
  try {
    const data = fs.readFileSync(settingsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    log.error('Error occurred in ipcMain.handle channel.GET_SETTING', error);
    return {};
  }
});

ipcMain.handle(channel.SET_SETTING, (event, content) => {
  try {
    const new_config = JSON.stringify(content);
    fs.writeFileSync(settingsPath, new_config, 'utf-8');
    return content;
  } catch (error) {
    log.debug('Error occurred in ipcMain.handle channel.SET_SETTING', content, error);
    return {};
  }
});

ipcMain.handle(channel.GET_LOCAL_FILE, (event, file_path) => {
  try {
    return fs.readFileSync(file_path);
  } catch (error) {
    log.error('Error occurred in ipcMain.handle channel.GET_LOCAL_FILE', error);
    return null;
  }
});

ipcMain.on(channel.POST_APP_IMAGE_SEARCH_REQ, (event, file_buffer: Buffer | null) => {
  event.sender.send(channel.POST_APP_IMAGE_SEARCH_RES, file_buffer);
});

ipcMain.on(channel.TRIGGER_SETTING_REQ, (event, setting) => {
  log.debug('Received updated settings');
  // Since we have multiple windows (e.g. NTQQ setting window & NTQQ chat window),
  // we need to send the updated settings to all windows
  BrowserWindow.getAllWindows().forEach((win, index) => {
    log.debug('Sending updated settings to window:', index);
    win.webContents.send(channel.TRIGGER_SETTING_RES, JSON.stringify(setting));
  });
});

ipcMain.on(channel.OPEN_WEB, (event, url) => shell.openExternal(url).then());
