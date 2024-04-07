import axios, { AxiosInstance } from 'axios';
import {pluginSettings} from "../Utils/pluginSettings";
import {pluginSettingsModel} from "../Models/pluginSettingsModel";

let apiClient: AxiosInstance | null;
let pluginSettingData: pluginSettingsModel = new pluginSettingsModel(null, null, null);

pluginSettings().then((settings) => {
    pluginSettingData = settings;
});

export function getClient() {
    if (!apiClient) {
        let headers = {
            'X-Access-Token': pluginSettingData.nekoimage_access_token,
            'X-Admin-Token': pluginSettingData.nekoimage_admin_token,
        };
        apiClient = axios.create({
            baseURL: pluginSettingData.nekoimage_api,
            headers: headers,
        });
    }

    return apiClient;
}

export function resetClient() {
    apiClient = null;
}