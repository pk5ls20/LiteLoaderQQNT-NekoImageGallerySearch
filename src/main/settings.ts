import * as fs from 'node:fs';
import path from 'node:path';
import { BrowserWindow, ipcMain } from 'electron';
import * as channel from '../common/channels';
import { pluginSettingsModel } from '../common/share/PluginSettingsModel';
import { log } from '../common/share/logs';

const pluginDataPath = LiteLoader.plugins['image_search'].path.data;
const settingsPath = path.join(pluginDataPath, 'settings.json');

ipcMain.handle(channel.GET_SETTING, (_): pluginSettingsModel | null => {
  try {
    const data = fs.readFileSync(settingsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    log.error('Error occurred in ipcMain.handle channel.GET_SETTING', error);
    return null;
  }
});

ipcMain.handle(channel.SET_SETTING, (_, content: pluginSettingsModel): pluginSettingsModel | {} => {
  try {
    const new_config = JSON.stringify(content);
    fs.writeFileSync(settingsPath, new_config, 'utf-8');
    return content;
  } catch (error) {
    log.debug('Error occurred in ipcMain.handle channel.SET_SETTING', content, error);
    return {};
  }
});

ipcMain.on(channel.TRIGGER_SETTING_REQ, (_, setting: pluginSettingsModel | null): void => {
  let settingStr: string | null = null;
  if (setting) {
    log.debug('Received updated settings');
    settingStr = JSON.stringify(setting);
  }
  // Since we have multiple windows (i.e. NTQQ setting window & NTQQ chat window),
  // we need to send the updated settings to all windows
  BrowserWindow.getAllWindows().forEach((win, index) => {
    log.debug('Sending updated settings to window:', index);
    win.webContents.send(channel.TRIGGER_SETTING_RES, settingStr);
  });
});
