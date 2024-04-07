import {log} from "../../logs";
import {devEnvWrap, isDevEnv} from "./envFlag";
import {getLLNTPluginSettings} from "./bridge";
import {pluginSettingsModel} from "../Models/pluginSettingsModel";

export async function pluginSettings() {
    log('isDevEnv=', isDevEnv)
    let settings = isDevEnv ? new pluginSettingsModel(
        devEnvWrap('NEKOIMAGE_API'),
        devEnvWrap('ACCESS_TOKEN'),
        devEnvWrap('ADMIN_TOKEN')
    ) : null;
    if (settings) {
        return settings;
    }
    return getLLNTPluginSettings();
}