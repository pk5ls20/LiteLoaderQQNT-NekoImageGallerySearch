import { sharedAdapter } from '../../adapter/SharedAdapter';
import { devEnvWrap } from '../../utils/envFlag';

interface pluginSettingsService {
  get(): Promise<sharedAdapter.PluginSettingsModelType | null>;
}

export class devPluginSettingsService implements pluginSettingsService {
  async get(): Promise<sharedAdapter.PluginSettingsModelType> {
    sharedAdapter.Log.debug('isDevEnv=', true);
    return new sharedAdapter.PluginSettingsModel(
      devEnvWrap('NEKOIMAGE_API') ?? '',
      devEnvWrap('ACCESS_TOKEN') ?? '',
      devEnvWrap('ADMIN_TOKEN') ?? ''
    );
  }
}

export class LLNTPluginSettingsService implements pluginSettingsService {
  async get(): Promise<sharedAdapter.PluginSettingsModelType> {
    const blankSettings = new sharedAdapter.PluginSettingsModel('', '', '');
    try {
      const settingsData = await window.imageSearch.getSettings();
      if (!settingsData) return blankSettings;
      return new sharedAdapter.PluginSettingsModel(
        settingsData.nekoimage_api,
        settingsData.nekoimage_access_token,
        settingsData.nekoimage_admin_token
      );
    } catch (error) {
      sharedAdapter.Log.error('Error fetching plugin settings:', error);
      return blankSettings;
    }
  }
}
