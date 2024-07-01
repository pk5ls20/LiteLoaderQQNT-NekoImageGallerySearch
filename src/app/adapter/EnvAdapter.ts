import { isDevEnv } from '../utils/envFlag';
import { sharedAdapter } from './SharedAdapter';
import { devPluginSettingsService, LLNTPluginSettingsService } from '../services/bridge/pluginSettingsService';
import { devAddNTQQEditorService, LLNTAddNTQQEditorService } from '../services/bridge/addNTQQEditorService';
import { devAdjustVisibleService, LLNTAdjustVisibleService } from '../services/bridge/adjustVisibleService';
import { devTriggerImageSearchService, LLNTTriggerImageSearchService } from '../services/bridge/triggerImageService';
import { devLogService, LLNTLogService } from '../services/bridge/logService';
import { devTriggerSettingService, LLNTTriggerSettingService } from '../services/bridge/triggerSettingService';
import { NTQQEditorMsg } from '../services/editor/editorMsgService';
import { devUploadAddFileService, LLNTUploadAddFileService } from '../services/bridge/uploadAddFileService';

export class EnvAdapter {
  static addNTQQEditor(message: NTQQEditorMsg[]): void {
    const service = isDevEnv ? new devAddNTQQEditorService() : new LLNTAddNTQQEditorService();
    return service.set(message);
  }

  static adjustVisible(state: boolean): Promise<void> {
    const service = isDevEnv ? new devAdjustVisibleService() : new LLNTAdjustVisibleService();
    return service.set(state);
  }

  static getSettings(): Promise<sharedAdapter.PluginSettingsModelType> {
    const service = isDevEnv ? new devPluginSettingsService() : new LLNTPluginSettingsService();
    return service.get();
  }

  static UploadAddFileService(): devUploadAddFileService | LLNTUploadAddFileService {
    return isDevEnv ? new devUploadAddFileService() : new LLNTUploadAddFileService();
  }

  static triggerImageService(): devTriggerImageSearchService | LLNTTriggerImageSearchService {
    return isDevEnv ? new devTriggerImageSearchService() : new LLNTTriggerImageSearchService();
  }

  static triggerSettingService(): devTriggerSettingService | LLNTTriggerSettingService {
    return isDevEnv ? new devTriggerSettingService() : new LLNTTriggerSettingService();
  }

  static log(...args: any[]): void {
    const service = isDevEnv ? new devLogService() : new LLNTLogService();
    return service.set(...args);
  }
}
