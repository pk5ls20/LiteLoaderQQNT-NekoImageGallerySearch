/// <reference path="../global.d.ts" />
import * as fs from 'node:fs';
import * as path from 'node:path';
import { log } from '../common/logs';
import { ipcMain, shell, BrowserWindow } from 'electron';

function openWeb(url: string) {
  shell.openExternal(url).then();
}

const pluginDataPath = LiteLoader.plugins['image_search'].path.data;
const settingsPath = path.join(pluginDataPath, 'settings.json');

if (!fs.existsSync(pluginDataPath)) {
  fs.mkdirSync(pluginDataPath, { recursive: true });
}

if (!fs.existsSync(settingsPath)) {
  fs.writeFileSync(
    settingsPath,
    JSON.stringify({
      nekoimage_api: '',
      nekoimage_access_token: '',
      nekoimage_admin_token: ''
    })
  );
} else {
  const data = fs.readFileSync(settingsPath, 'utf-8');
  const config = JSON.parse(data);
}

ipcMain.handle('LiteLoader.imageSearch.getSettings', (event, message) => {
  try {
    const data = fs.readFileSync(settingsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    log.error("Error occurred in ipcMain.handle('LiteLoader.imageSearch.getSettings')", error);
    return {};
  }
});

ipcMain.handle('LiteLoader.imageSearch.setSettings', (event, content) => {
  try {
    const new_config = JSON.stringify(content);
    fs.writeFileSync(settingsPath, new_config, 'utf-8');
    return content;
  } catch (error) {
    log.debug("Error occurred in ipcMain.handle('LiteLoader.imageSearch.setSettings')", content, error);
  }
});

ipcMain.on('LiteLoader.imageSearch.openWeb', (event, message) => openWeb(message));

ipcMain.handle('LiteLoader.imageSearch.getLocalFile', (event, file_path) => {
  try {
    return fs.readFileSync(file_path);
  } catch (error) {
    log.error("Error occurred in ipcMain.handle('LiteLoader.imageSearch.getLocalFile')", error);
    return null;
  }
});

ipcMain.on('LiteLoader.imageSearch.postAppImageSearchReq', (event, file_buffer: Buffer | null) => {
  event.sender.send('LiteLoader.imageSearch.imageSearchResponse', file_buffer);
});

ipcMain.handle('LiteLoader.imageSearch.logToMain', (event, ...args) => {
  log.debug('Error occurred in LiteLoader.imageSearch.logToMain', ...args);
});

ipcMain.on('LiteLoader.imageSearch.triggerSettingReq', (event, setting) => {
  log.debug('Received updated settings');
  BrowserWindow.getAllWindows().forEach((win, index) => {
    log.debug('Sending updated settings to window:', index);
    win.webContents.send('LiteLoader.imageSearch.triggerSettingResponse', JSON.stringify(setting));
  });
});
