/// <reference types="../../../global.d.ts" />
import { pluginSettingsModel } from '../../models/search/PluginSettingsModel';
import { devEnvWrap } from '../../utils/envFlag';

interface pluginSettingsService {
  get(): Promise<pluginSettingsModel | null>;
}

export class devPluginSettingsService implements pluginSettingsService {
  async get(): Promise<pluginSettingsModel> {
    console.log('isDevEnv=', true);
    return new pluginSettingsModel(
      devEnvWrap('NEKOIMAGE_API') ?? '',
      devEnvWrap('ACCESS_TOKEN') ?? '',
      devEnvWrap('ADMIN_TOKEN') ?? ''
    );
  }
}

export class LLNTPluginSettingsService implements pluginSettingsService {
  async get(): Promise<pluginSettingsModel> {
    const blankSettings = new pluginSettingsModel('', '', '');
    try {
      const settingsData = await window.imageSearch.getSettings();
      if (!settingsData) return blankSettings;
      return new pluginSettingsModel(
        settingsData.nekoimage_api,
        settingsData.nekoimage_access_token,
        settingsData.nekoimage_admin_token
      );
    } catch (error) {
      console.error('Error fetching plugin settings:', error);
      return blankSettings;
    }
  }
}
