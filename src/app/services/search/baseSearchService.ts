// reference https://github.com/hv0905/NekoImageGallery.App/blob/master/src/Services/Base.ts
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { EnvAdapter } from '../../adapter/EnvAdapter';
import { sharedAdapter } from '../../adapter/SharedAdapter';

let apiClient: AxiosInstance | null;
let pluginSettingData: sharedAdapter.PluginSettingsModelType | null = new sharedAdapter.PluginSettingsModel('', '', '');

// TODO: rewrite
EnvAdapter.getSettings().then((settings) => {
  pluginSettingData = settings;
});

export function getClient() {
  if (!apiClient) {
    const headers = {
      'X-Access-Token': pluginSettingData?.nekoimage_access_token,
      'X-Admin-Token': pluginSettingData?.nekoimage_admin_token
    };
    apiClient = axios.create({
      baseURL: pluginSettingData?.nekoimage_api,
      headers: headers
    });
  }
  return apiClient;
}

export function resetClient(settingData?: sharedAdapter.PluginSettingsModelType) {
  if (settingData) {
    pluginSettingData = settingData;
  }
  apiClient = null;
}
