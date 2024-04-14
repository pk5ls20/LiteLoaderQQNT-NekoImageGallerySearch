import {isDevEnv} from "../Utils/envFlag";
import {pluginSettingsModel} from "../Models/pluginSettingsModel";
import {devPluginSettingsService, LLNTPluginSettingsService} from "../Services/bridge/pluginSettingsService";
import {devAddNTQQEditorService, LLNTAddNTQQEditorService} from "../Services/bridge/addNTQQEditorService";
import {devAdjustVisibleService, LLNTAdjustVisibleService} from "../Services/bridge/adjustVisibleService";
import {
    devTriggerImageSearchService,
    LLNTTriggerImageSearchService
} from "../Services/bridge/triggerImageSearchService";
import {devLogService, LLNTLogService} from "../Services/bridge/logService";

export class EnvAdapter {
    static addNTQQEditor(message: { src: string; }): void {
        const service = isDevEnv ? new devAddNTQQEditorService() : new LLNTAddNTQQEditorService();
        return service.set(message);
    }

    static adjustVisible(state: boolean): Promise<void> {
        const service = isDevEnv ? new devAdjustVisibleService() : new LLNTAdjustVisibleService();
        return service.set(state);
    }

    static getSettings(): Promise<pluginSettingsModel | null> {
        const service = isDevEnv ? new devPluginSettingsService() : new LLNTPluginSettingsService();
        return service.get();
    }

    static triggerImageSearchService(): devTriggerImageSearchService | LLNTTriggerImageSearchService {
        return isDevEnv ? new devTriggerImageSearchService() : new LLNTTriggerImageSearchService();
    }

    static log(...args: any[]): void {
        const service = isDevEnv ? new devLogService() : new LLNTLogService();
        return service.set(...args);
    }
}