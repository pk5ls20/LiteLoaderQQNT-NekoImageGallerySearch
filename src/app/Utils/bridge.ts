// Senseless access to APIs exposed via LLNT
// All API calls for the design llnt will appear only in this file

import {pluginSettingsModel} from "../Models/pluginSettingsModel";

export async function getLLNTPluginSettings(): Promise<pluginSettingsModel | null> {
    try {
        const settingsData = await window.imageSearch.getSettings();
        if (!settingsData) return null;
        return {
            nekoimage_api: settingsData.nekoimage_api || null,
            nekoimage_access_token: settingsData.nekoimage_access_token || null,
            nekoimage_admin_token: settingsData.nekoimage_admin_token || null,
        };
    } catch (error) {
        console.error("Error fetching plugin settings:", error);
        return null;
    }
}
