import {pluginSettingsModel} from "../../Models/pluginSettingsModel";
import {devEnvWrap} from "../../Utils/envFlag";

interface pluginSettingsService {
    get(): Promise<pluginSettingsModel | null>;
}

export class devPluginSettingsService implements pluginSettingsService {
    async get(): Promise<pluginSettingsModel | null> {
        console.log('isDevEnv=', true);
        return new pluginSettingsModel(
            devEnvWrap('NEKOIMAGE_API'),
            devEnvWrap('ACCESS_TOKEN'),
            devEnvWrap('ADMIN_TOKEN')
        );
    }
}

export class LLNTPluginSettingsService implements pluginSettingsService {
    async get(): Promise<pluginSettingsModel | null> {
        try {
            const settingsData = await window.imageSearch.getSettings();
            if (!settingsData) return null;
            return new pluginSettingsModel(
                settingsData.nekoimage_api || null,
                settingsData.nekoimage_access_token || null,
                settingsData.nekoimage_admin_token || null
            );
        } catch (error) {
            console.error("Error fetching plugin settings:", error);
            return null;
        }
    }
}