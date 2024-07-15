/// <reference path="../global.d.ts" />
import * as fs from 'node:fs';
import * as path from 'node:path';
import { BrowserWindow } from 'electron';
import { log } from '../common/share/logs';
import { pluginSettingsModel } from '../common/share/PluginSettingsModel';
import { hookIpc } from './native/sora/hookipc';
import './fs';
import './callNative';
import './settings';
import './nekoSync';
import './misc';

const pluginDataPath = LiteLoader.plugins['image_search'].path.data;
const settingsPath = path.join(pluginDataPath, 'settings.json');

if (!fs.existsSync(pluginDataPath)) {
  log.debug('Plugin data path not found, creating new plugin data path');
  fs.mkdirSync(pluginDataPath, { recursive: true });
}
if (!fs.existsSync(settingsPath)) {
  log.debug('Settings file not found, creating new settings file');
  const setting = new pluginSettingsModel('', '', '');
  fs.writeFileSync(settingsPath, JSON.stringify(setting));
}

export const onBrowserWindowCreated = (window: BrowserWindow) => {
  hookIpc(window);
};
