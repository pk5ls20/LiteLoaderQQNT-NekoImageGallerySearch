import { pluginSettingsModel } from '../common/share/PluginSettingsModel';
import { ipcRenderer } from 'electron';
import * as channel from '../common/channels';
import { log } from '../common/share/logs';

export const getSettings = async (): Promise<pluginSettingsModel | null> => {
  try {
    return await ipcRenderer.invoke(channel.GET_SETTING);
  } catch (error) {
    log.error('Error retrieving settings:', error);
    return null;
  }
};

export const setSettings = async (content: pluginSettingsModel): Promise<void> => {
  try {
    const response = await ipcRenderer.invoke(channel.SET_SETTING, content);
    ipcRenderer.send(channel.TRIGGER_SETTING_REQ, response);
  } catch (error) {
    log.error('Error updating settings:', error);
  }
};

export const triggerSettingReq = (setting: string | null): void => {
  ipcRenderer.send(channel.TRIGGER_SETTING_REQ, setting);
};

export const triggerSettingRes = (callback: (setting: string | null) => Promise<void>): void => {
  ipcRenderer.on(channel.TRIGGER_SETTING_RES, async (_, response) => {
    try {
      await callback(response);
      log.debug('Callback successfully executed');
    } catch (error) {
      log.error('TriggerSetting await callback: Error processing image search response:', error);
    }
  });
};
