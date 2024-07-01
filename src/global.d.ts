import 'vite/client';
import { pluginSettingsModel } from './common/share/PluginSettingsModel';
import { TriggerImageRegisterName } from './common/share/triggerImageRegisterName';

declare global {
  interface Window {
    imageSearch: {
      getSettings: () => Promise<pluginSettingsModel | null>;
      setSettings: (content: pluginSettingsModel) => Promise<void>;
      getLocalFileAsUInt8Array: (filePath: string) => Promise<Uint8Array | null>;
      postAppImageReq: (file_content: Uint8Array | null, registerNum: TriggerImageRegisterName) => void;
      postAppImageRes: (
        callback: (file_content: Uint8Array | null) => Promise<void>,
        registerNum: TriggerImageRegisterName
      ) => void;
      triggerSettingReq: (setting: string | null) => void;
      triggerSettingRes: (callback: (setting: string | null) => Promise<void>) => void;
      openWeb: (url: string) => void;
      selectFiles: (multiple: boolean, accept: string[]) => Promise<File[]>;
      selectDirectory: (accept: string[] | null) => Promise<File[]>;
    };
  }
}

declare module '*.svg' {
  const content: unknown;
}

export {};
