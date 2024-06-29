import 'vite/client';
import { pluginSettingsModel } from './common/share/PluginSettingsModel';

declare global {
  interface Window {
    imageSearch: {
      getSettings: () => Promise<pluginSettingsModel | null>;
      setSettings: (content: pluginSettingsModel) => Promise<void>;
      getLocalFileAsBlob: (filePath: string) => Promise<Blob | null>;
      postAppImageSearchReq: (file_content: Blob | null) => void;
      postAppImageSearchRes: (callback: (file_content: Buffer | null) => Promise<void>) => void;
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
